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
        }
      });

      // Connection status handlers
      socket.on('connect', () => {
        console.log('Socket connected');
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('error', (error: any) => {
        console.error('Socket error:', error);
      });
    }

    // Listen for phishing attempt updates
    socket.on('phishingAttemptUpdated', (updatedAttempt: PhishingAttempt) => {
      // Update the query cache with the new data
      queryClient.setQueryData(['phishingAttempt', updatedAttempt.id], updatedAttempt);

      // Invalidate the list query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['phishingAttempts'] });
    });

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.off('phishingAttemptUpdated');
      }
    };
  }, [queryClient]);

  // Return functions to interact with the socket
  return {
    subscribeToAttempts: () => {
      if (socket) {
        socket.emit('subscribeToPhishingAttempts');
      }
    },
    unsubscribeFromAttempts: () => {
      if (socket) {
        socket.emit('unsubscribeFromPhishingAttempts');
      }
    },
    disconnect: () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    }
  };
};
