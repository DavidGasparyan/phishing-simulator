import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PhishingAttempt } from '@phishing-simulator/shared-types';

@WebSocketGateway({
  namespace: '/socket.io',
  cors: {
    origin: '*',
  },
  path: '/api/management/socket.io',
})
@Injectable()
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebsocketGateway.name);

  // Map to track socket connections and associated user IDs
  private connections: Map<string, { userId: string; role: string }> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('PhishingAttempt')
    private phishingAttemptModel: Model<PhishingAttempt>,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      // Log the connection attempt
      this.logger.log(`Connection attempt from client: ${client.id}`);

      // Extract token from the socket handshake auth
      const token = client.handshake.auth.token;
      if (!token) {
        this.logger.warn('No authentication token provided - allowing temporary connection');
        // Allow connection without auth to support first-time connections
        // The client will need to authenticate later or won't receive sensitive data
        return;
      }

      try {
        // Verify the JWT token
        const payload = this.jwtService.verify(token);

        // Store user info associated with this socket
        this.connections.set(client.id, {
          userId: payload.sub,
          role: payload.role,
        });

        this.logger.log(`Client authenticated: ${client.id} (User: ${payload.sub})`);
      } catch (jwtError) {
        this.logger.error(`JWT verification error: ${jwtError.message}`);
        // Don't disconnect - allow client to potentially provide valid token later
      }
    } catch (error) {
      this.logger.error(`Connection handling error: ${error.message}`);
      // Log the error but don't disconnect to give the client a chance to reconnect
    }
  }

  handleDisconnect(client: Socket) {
    // Remove client from connections map
    this.connections.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToPhishingAttempts')
  async subscribeToPhishingAttempts(client: Socket): Promise<void> {
    const connection = this.connections.get(client.id);
    if (!connection) {
      this.logger.warn(`Unauthenticated client ${client.id} attempted to subscribe to phishing attempts`);
      // Instead of throwing an exception, let's send a message back
      client.emit('authRequired', { message: 'Authentication required' });
      return;
    }

    this.logger.log(`Client ${client.id} subscribed to phishing attempts updates`);
    // Add the client to a room for phishing updates (we could have per-user rooms if needed)
    client.join('phishing-updates');

    // Confirm subscription to client
    client.emit('subscriptionConfirmed', {
      message: 'Successfully subscribed to phishing attempt updates',
      userId: connection.userId
    });
  }

  @SubscribeMessage('unsubscribeFromPhishingAttempts')
  async unsubscribeFromPhishingAttempts(client: Socket): Promise<void> {
    client.leave('phishing-updates');
    this.logger.log(`Client ${client.id} unsubscribed from phishing attempts updates`);
  }

  // Method to notify clients about updated phishing attempts
  notifyPhishingAttemptUpdate(phishingAttempt: PhishingAttempt): void {
    this.server.to('phishing-updates').emit('phishingAttemptUpdated', phishingAttempt);
    this.logger.log(`Notified clients about updated phishing attempt: ${phishingAttempt.id}`);
  }

  // Method to notify about a specific status change
  notifyPhishingAttemptStatusChange(
    phishingAttempt: PhishingAttempt,
    previousStatus: string
  ): void {
    this.server.to('phishing-updates').emit('phishingAttemptStatusChanged', {
      phishingAttempt,
      previousStatus,
    });
    this.logger.log(
      `Notified clients about status change for phishing attempt ${phishingAttempt.id}: ${previousStatus} -> ${phishingAttempt.status}`
    );
  }
}
