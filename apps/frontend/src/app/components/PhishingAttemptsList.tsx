import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePhishingAttempts } from '../services/phishing.service';
import { useSocketConnection } from '../services/socket.service';
import { PhishingAttempt } from '../models/phishing-attempt.model';

const PhishingAttemptsList: React.FC = () => {
  const { data: attempts = [], isLoading, isError, refetch } = usePhishingAttempts();
  const socketService = useSocketConnection();

  useEffect(() => {
    // Subscribe to real-time updates when component mounts
    socketService.subscribeToAttempts();

    // Unsubscribe when component unmounts
    return () => {
      socketService.unsubscribeFromAttempts();
    };
  }, [socketService]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="status-new">New</span>;
      case 'SENT':
        return <span className="status-sent">Sent</span>;
      case 'CLICKED':
        return <span className="status-clicked">Clicked</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
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

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Phishing Attempts</h1>
        </div>
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
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Phishing Attempts</h1>
        <Link
          to="/phishing-simulation"
          className="btn btn-primary"
        >
          New Simulation
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {attempts.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No phishing attempts yet.</p>
            <Link
              to="/phishing-simulation"
              className="mt-4 inline-block btn btn-primary"
            >
              Create Your First Simulation
            </Link>
          </div>
        ) : (
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
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
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
                    {attempt.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attempt.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(attempt.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(attempt.sentAt || '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(attempt.clickedAt || '')}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhishingAttemptsList;
