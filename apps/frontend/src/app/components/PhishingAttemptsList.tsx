import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePhishingAttempts } from '../services/phishing.service';
import { useSocketConnection } from '../services/socket.service';
import { PhishingAttempt } from '../models/phishing-attempt.model';
import { toast } from 'react-toastify';

const PhishingAttemptsList: React.FC = () => {
  console.log('PhishingAttemptsList component rendering');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = usePhishingAttempts();

  const socketConnection = useSocketConnection();
  const [receivedUpdates, setReceivedUpdates] = useState<PhishingAttempt[]>([]);

  // Subscribe to phishing updates
  useEffect(() => {
    console.log('Setting up socket subscription');

    // Subscribe after a small delay to ensure socket is ready
    const subscribeTimer = setTimeout(() => {
      socketConnection.subscribeToAttempts();
    }, 1000);

    // Clean up on unmount
    return () => {
      clearTimeout(subscribeTimer);
      socketConnection.unsubscribeFromAttempts();
    };
  }, [socketConnection]);

  // Setup direct phishing attempt update handlers
  useEffect(() => {
    const socket = socketConnection.getSocket();
    if (!socket) return;

    // Handle phishing attempt updates
    const handleAttemptUpdate = (updatedAttempt: PhishingAttempt) => {
      console.log('🔴 RECEIVED UPDATE:', updatedAttempt);

      // Add to received updates list
      setReceivedUpdates(prev => {
        const exists = prev.some(a => a.id === updatedAttempt.id);
        if (!exists) {
          return [...prev, updatedAttempt];
        }
        return prev;
      });

      // Refresh data
      refetch();

      // Show notification
      toast.info(`Phishing attempt updated: ${updatedAttempt.id}`);
    };

    // Handle status changes
    const handleStatusChange = (data: {
      phishingAttempt: PhishingAttempt;
      previousStatus: string
    }) => {
      console.log('🔴 RECEIVED STATUS CHANGE:', data);

      // Add to received updates list
      setReceivedUpdates(prev => {
        const exists = prev.some(a => a.id === data.phishingAttempt.id);
        if (!exists) {
          return [...prev, data.phishingAttempt];
        }
        return prev;
      });

      // Refresh data
      refetch();

      // Show notification
      toast.info(`Status changed: ${data.previousStatus} → ${data.phishingAttempt.status}`);
    };

    // Add event listeners directly to socket
    socket.on('phishingAttemptUpdated', handleAttemptUpdate);
    socket.on('phishingAttemptStatusChanged', handleStatusChange);

    // Remove event listeners on cleanup
    return () => {
      socket.off('phishingAttemptUpdated', handleAttemptUpdate);
      socket.off('phishingAttemptStatusChanged', handleStatusChange);
    };
  }, [socketConnection, refetch]);

  // Log errors
  useEffect(() => {
    if (isError && error) {
      console.error('Error fetching phishing attempts:', error);
      toast.error('Error loading phishing attempts');
    }
  }, [isError, error]);

  const attempts = data?.attempts || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
      case 'CLICKED':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Clicked</span>;
      case 'FAILED':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Failed</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  const renderReceivedUpdates = () => {
    if (receivedUpdates.length === 0) return null;

    return (
      <div className="bg-yellow-50 p-4 rounded-md mb-4">
        <h3 className="font-bold text-yellow-800 mb-2">Received WebSocket Updates</h3>
        <ul>
          {receivedUpdates.map(update => (
            <li key={update.id} className="text-sm text-yellow-700">
              Attempt {update.id} - Status: {update.status}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        {renderReceivedUpdates()}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Phishing Attempts</h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {renderReceivedUpdates()}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Phishing Attempts</h1>
        <div className="flex items-center gap-4">
          {/* Socket connection status indicator */}
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${socketConnection.connected
              ? socketConnection.authenticated ? 'bg-green-500' : 'bg-yellow-500'
              : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {socketConnection.connected
                ? socketConnection.authenticated
                  ? 'Real-time updates active'
                  : 'Connected (authenticating...)'
                : 'Offline mode'}
            </span>
          </div>

          <Link
            to="/phishing-simulation"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Simulation
          </Link>
        </div>
      </div>

      {isError ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="bg-red-50 border border-red-300 rounded-md p-4">
            <p className="text-red-700">
              Error loading phishing attempts. Please try again later.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : attempts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No phishing attempts yet.</p>
          <Link
            to="/phishing-simulation"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Your First Simulation
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicked
                </th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {attempts.map((attempt: PhishingAttempt) => (
                <tr key={attempt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(attempt.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attempt.recipientEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(attempt.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(attempt.clickedAt || '')}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhishingAttemptsList;
