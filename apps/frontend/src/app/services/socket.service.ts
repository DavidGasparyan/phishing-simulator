import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { PhishingAttempt } from '../models/phishing-attempt.model';
import AuthService from './auth.service';

/**
 * Socket service with corrected path configuration
 */
export const useSocketConnection = () => {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // One-time socket setup
  useEffect(() => {
    console.log('🔍 DEBUG: Creating socket connection - attempt #', connectionAttempts + 1);

    try {
      // Create socket with fixed path configuration matching backend
      const socketInstance = io(window.location.origin, {
        path: '/api/management/socket.io', // This matches the global prefix + socket.io path
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        forceNew: true, // Force new connection
        timeout: 10000
      });

      console.log('🔍 DEBUG: Socket instance created with path: /api/management/socket.io');
      setSocket(socketInstance);

      // Connection and error events
      socketInstance.on('connect', () => {
        console.log('🟢 Socket connected with ID:', socketInstance.id);
        setConnected(true);

        // Log detailed connection info
        console.log('🔍 Socket details:', {
          connected: socketInstance.connected,
          id: socketInstance.id
        });
      });

      socketInstance.on('connect_error', (error) => {
        console.error('🔴 Socket connection error:', error.message);
        console.error('🔍 DEBUG: Full error details:', error);
        setConnected(false);

        // Increment connection attempts
        setConnectionAttempts(prev => prev + 1);
      });

      socketInstance.on('error', (error) => {
        console.error('🔴 Socket error:', error);
        setConnected(false);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('🔴 Socket disconnected, reason:', reason);
        setConnected(false);
        setAuthenticated(false);
      });

      // Authentication response events (from auto-auth on server)
      socketInstance.on('authSuccess', (data) => {
        console.log('✅ Authentication successful:', data);
        setAuthenticated(true);
      });

      // Welcome event - auto-subscribe after welcome
      socketInstance.on('welcome', (data) => {
        console.log('👋 Received welcome:', data);
      });

      // Subscription events
      socketInstance.on('subscriptionConfirmed', (data) => {
        console.log('✅ Subscription confirmed:', data);
      });

      // Catch all events for debugging
      socketInstance.onAny((event, ...args) => {
        console.log(`🔍 DEBUG: Received event "${event}":`, args);
      });

      // Phishing attempt events
      socketInstance.on('phishingAttemptUpdated', (updatedAttempt: PhishingAttempt) => {
        console.log('📩 Received phishing attempt update:', updatedAttempt);

        // Update the query cache
        queryClient.setQueryData(['phishingAttempt', updatedAttempt.id], updatedAttempt);
        queryClient.invalidateQueries({ queryKey: ['phishingAttempts'] });
      });

      socketInstance.on('phishingAttemptStatusChanged', (data: {
        phishingAttempt: PhishingAttempt;
        previousStatus: string;
      }) => {
        console.log('📩 Received status change:', data);

        // Update the query cache
        queryClient.setQueryData(
          ['phishingAttempt', data.phishingAttempt.id],
          data.phishingAttempt
        );
        queryClient.invalidateQueries({ queryKey: ['phishingAttempts'] });
      });

      // Manual ping to verify connection working
      const pingInterval = setInterval(() => {
        if (socketInstance.connected) {
          console.log('🔍 Sending ping to verify connection');
          socketInstance.emit('ping');
        }
      }, 30000); // Every 30 seconds

      // Cleanup on unmount
      return () => {
        console.log('🧹 Cleaning up socket connection');
        clearInterval(pingInterval);
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    } catch (error) {
      console.error('❌ Error creating socket:', error);
    }
  }, [queryClient, connectionAttempts]);

  return {
    socket,
    connected,
    authenticated,
    subscribeToAttempts: () => {
      if (socket && connected) {
        console.log('📩 Manually subscribing to phishing attempts');
        socket.emit('subscribeToPhishingAttempts');
        return true;
      }
      return false;
    },
    unsubscribeFromAttempts: () => {
      if (socket && connected) {
        socket.emit('unsubscribeFromPhishingAttempts');
      }
    },
    checkConnection: () => connected,
    checkAuthentication: () => authenticated,
    authenticate: () => {
      // No-op for compatibility
      return true;
    },
    getSocket: () => socket,
  };
};

export default useSocketConnection;
