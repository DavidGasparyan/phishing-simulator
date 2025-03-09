import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PhishingAttempt } from '@phishing-simulator/shared-types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebsocketGateway.name);

  // Map to track socket connections (no auth required now)
  private connections: Map<string, { userId: string; role: string }> = new Map();
  // Track all sockets
  private allSockets: Set<string> = new Set();

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('PhishingAttempt')
    private phishingAttemptModel: Model<PhishingAttempt>,
  ) {}

  onModuleInit() {
    this.logger.log('[DIAGNOSTIC] WebSocket Gateway initialized - DEBUG MODE');

    // Debug connection count
    setInterval(() => {
      this.logger.log(`[DIAGNOSTIC] Current socket stats: Total=${this.allSockets.size}, Subscribed=${this.connections.size}`);
      if (this.connections.size > 0) {
        this.logger.log('[DIAGNOSTIC] Active subscribed connections:');
        this.connections.forEach((data, clientId) => {
          this.logger.log(`- Client: ${clientId}, User: ${data.userId}, Role: ${data.role}`);
        });
      }
    }, 15000);
  }

  afterInit(server: Server) {
    this.logger.log('[DIAGNOSTIC] WebSocket Server initialized with config:');
    this.logger.log(`- Adapter: ${server.adapter.constructor.name}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`[DIAGNOSTIC] New client connected: ${client.id}`);

    // Add to all sockets tracking
    this.allSockets.add(client.id);

    try {
      // Log connection details
      this.logger.log(`[DIAGNOSTIC] Connection details:`);
      this.logger.log(`- Transport: ${client.conn.transport.name}`);
      this.logger.log(`- Query params: ${JSON.stringify(client.handshake.query)}`);
      this.logger.log(`- Headers:`, client.handshake.headers);

      // Send welcome event
      client.emit('welcome', {
        message: 'Connected to WebSocket server',
        socketId: client.id,
        timestamp: new Date().toISOString()
      });

      // Auto-authenticate all clients (no auth required)
      this.autoAuthenticateClient(client);

    } catch (error) {
      this.logger.error(`[DIAGNOSTIC] Error in handleConnection: ${error.message}`);
      this.logger.error(error.stack);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[DIAGNOSTIC] Client disconnected: ${client.id}`);
    this.connections.delete(client.id);
    this.allSockets.delete(client.id);
    this.logger.log(`[DIAGNOSTIC] Remaining connections: ${this.connections.size}`);
  }

  // New method to auto-authenticate all clients without token verification
  private autoAuthenticateClient(client: Socket) {
    this.logger.log(`[DIAGNOSTIC] Auto-authenticating client ${client.id}`);

    // Add to authenticated connections with default values
    this.connections.set(client.id, {
      userId: `auto-${client.id.substring(0, 8)}`,
      role: 'user',
    });

    this.logger.log(`[DIAGNOSTIC] Client ${client.id} auto-authenticated`);

    // Emit success event
    client.emit('authSuccess', {
      message: 'Authentication successful (auto)',
      userId: `auto-${client.id.substring(0, 8)}`,
      role: 'user'
    });

    this.logger.log(`[DIAGNOSTIC] Total authenticated clients: ${this.connections.size}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket): WsResponse<string> {
    this.logger.log(`[DIAGNOSTIC] Received ping from client ${client.id}`);
    return { event: 'pong', data: 'pong' };
  }

  // Keep authenticate method for backward compatibility
  @SubscribeMessage('authenticate')
  async authenticate(client: Socket, data: { token: string }): Promise<void> {
    this.logger.log(`[DIAGNOSTIC] Authentication request from client ${client.id} - Auto-authenticating`);

    // Auto-authenticate without checking token
    this.autoAuthenticateClient(client);
  }

  @SubscribeMessage('subscribeToPhishingAttempts')
  async subscribeToPhishingAttempts(client: Socket): Promise<void> {
    this.logger.log(`[DIAGNOSTIC] Subscription request from client ${client.id}`);

    // Auto-authenticate if not already done
    if (!this.connections.has(client.id)) {
      this.autoAuthenticateClient(client);
    }

    // Join room for broadcasts
    client.join('phishing-updates');

    const connection = this.connections.get(client.id);
    this.logger.log(`[DIAGNOSTIC] Client ${client.id} (User: ${connection.userId}) subscribed to updates`);

    // Confirm subscription
    client.emit('subscriptionConfirmed', {
      message: 'Successfully subscribed to phishing attempt updates',
      userId: connection.userId
    });
  }

  @SubscribeMessage('unsubscribeFromPhishingAttempts')
  async unsubscribeFromPhishingAttempts(client: Socket): Promise<void> {
    this.logger.log(`[DIAGNOSTIC] Client ${client.id} unsubscribing`);
    client.leave('phishing-updates');
  }

  /**
   * Get the current number of connections
   */
  getConnectionsCount() {
    return {
      total: this.allSockets.size,
      subscribed: this.connections.size
    };
  }

  /**
   * Notify clients about an updated phishing attempt
   */
  notifyPhishingAttemptUpdate(phishingAttempt: PhishingAttempt): void {
    this.logger.log(`[DIAGNOSTIC] Broadcasting update for phishing attempt ${phishingAttempt.id}`);

    // Check subscribed clients
    const subscribedClients = Array.from(this.connections.keys());
    this.logger.log(`[DIAGNOSTIC] Total subscribed clients: ${subscribedClients.length}`);

    if (subscribedClients.length === 0) {
      this.logger.warn('[DIAGNOSTIC] No subscribed clients to notify');
      return;
    }

    // Broadcast to room
    this.logger.log('[DIAGNOSTIC] Broadcasting to phishing-updates room');
    this.server.to('phishing-updates').emit('phishingAttemptUpdated', phishingAttempt);

    // Also send to each client individually as fallback
    for (const clientId of subscribedClients) {
      const socket = this.server.sockets.sockets.get(clientId);
      if (socket) {
        socket.emit('phishingAttemptUpdated', phishingAttempt);
      }
    }
  }

  /**
   * Notify clients about a status change
   */
  notifyPhishingAttemptStatusChange(
    phishingAttempt: PhishingAttempt,
    previousStatus: string
  ): void {
    this.logger.log(`[DIAGNOSTIC] Broadcasting status change for attempt ${phishingAttempt.id}`);

    // Check subscribed clients
    const subscribedClients = Array.from(this.connections.keys());
    this.logger.log(`[DIAGNOSTIC] Total subscribed clients for status change: ${subscribedClients.length}`);

    if (subscribedClients.length === 0) {
      this.logger.warn('[DIAGNOSTIC] No subscribed clients to notify about status change');
      return;
    }

    const updateData = {
      phishingAttempt,
      previousStatus,
    };

    // Broadcast to room
    this.server.to('phishing-updates').emit('phishingAttemptStatusChanged', updateData);

    // Also send to each client individually as fallback
    for (const clientId of subscribedClients) {
      const socket = this.server.sockets.sockets.get(clientId);
      if (socket) {
        socket.emit('phishingAttemptStatusChanged', updateData);
      }
    }
  }
}
