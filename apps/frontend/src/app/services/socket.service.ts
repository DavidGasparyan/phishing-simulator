import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { PhishingAttempt } from '../models/phishing-attempt.model';

let socket: Socket | null = null;

export const useSocketConnection = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize socket connection if not already connected
    if (!socket) {
      socket = io(window.location.origin, {
        path: '/api/management/socket.io',
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection status handlers
      socket.on('connect', () => {
        console.log('Socket connected successfully');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      socket.on('error', (error: any) => {
        console.error('Socket error:', error);
      });
    }

    // Listen for phishing attempt updates
    socket.on('phishingAttemptUpdated', (updatedAttempt: PhishingAttempt) => {
      console.log('Received phishing attempt update:', updatedAttempt);

      // Update the query cache with the new data
      queryClient.setQueryData(['phishingAttempt', updatedAttempt.id], updatedAttempt);

      // Invalidate the list query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['phishingAttempts'] });
    });

    // Listen for status changes specifically
    socket.on('phishingAttemptStatusChanged', (data: {
      phishingAttempt: PhishingAttempt;
      previousStatus: string;
    }) => {
      console.log(`Status changed from ${data.previousStatus} to ${data.phishingAttempt.status}`);

      // Update the query cache with the new data
      queryClient.setQueryData(['phishingAttempt', data.phishingAttempt.id], data.phishingAttempt);

      // Invalidate the list query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['phishingAttempts'] });
    });

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.off('phishingAttemptUpdated');
        socket.off('phishingAttemptStatusChanged');
      }
    };
  }, [queryClient]);

  // Return functions to interact with the socket
  return {
    subscribeToAttempts: () => {
      if (socket && socket.connected) {
        console.log('Subscribing to phishing attempts updates');
        socket.emit('subscribeToPhishingAttempts');
      } else {
        console.warn('Socket not connected, cannot subscribe');
      }
    },
    unsubscribeFromAttempts: () => {
      if (socket && socket.connected) {
        console.log('Unsubscribing from phishing attempts updates');
        socket.emit('unsubscribeFromPhishingAttempts');
      }
    },
    disconnect: () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    },
    checkConnection: () => {
      return socket?.connected || false;
    }
  };
};
