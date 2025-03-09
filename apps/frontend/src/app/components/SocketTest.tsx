import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AuthService from '../services/auth.service';

const SocketTest: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string>('');

  // Add a log message with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Connect socket
  const connectSocket = () => {
    try {
      // Get current token
      const authToken = AuthService.getToken();
      setToken(authToken || '');

      // Clean token (remove Bearer if present)
      let cleanToken = authToken;
      if (authToken && authToken.startsWith('Bearer ')) {
        cleanToken = authToken.substring(7);
      }

      addLog(`Creating socket with token: ${cleanToken ? 'Present' : 'Missing'}`);

      const newSocket = io(window.location.origin, {
        path: '/api/management/socket.io',
        auth: {
          token: cleanToken
        },
        transports: ['websocket', 'polling'],
        reconnection: false,
      });

      setSocket(newSocket);

      // Socket events
      newSocket.on('connect', () => {
        addLog(`Connected with ID: ${newSocket.id}`);
        setConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        addLog(`Disconnected: ${reason}`);
        setConnected(false);
        setAuthenticated(false);
      });

      newSocket.on('connect_error', (error) => {
        addLog(`Connection error: ${error.message}`);
      });

      newSocket.on('error', (error) => {
        addLog(`Socket error: ${error}`);
      });

      newSocket.on('authSuccess', (data) => {
        addLog(`Authentication successful: ${JSON.stringify(data)}`);
        setAuthenticated(true);
      });

      newSocket.on('authError', (error) => {
        addLog(`Authentication error: ${JSON.stringify(error)}`);
      });

      newSocket.on('authRequired', () => {
        addLog('Authentication required');
      });

      newSocket.on('subscriptionConfirmed', (data) => {
        addLog(`Subscription confirmed: ${JSON.stringify(data)}`);
      });

      // Event listener for any event
      newSocket.onAny((event, ...args) => {
        addLog(`Event received: ${event} - ${JSON.stringify(args)}`);
      });

      return newSocket;
    } catch (error) {
      addLog(`Error creating socket: ${error}`);
      return null;
    }
  };

  // Disconnect socket
  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      addLog('Socket disconnected manually');
    }
  };

  // Send authentication
  const sendAuthentication = () => {
    if (!socket || !connected) {
      addLog('Cannot authenticate - socket not connected');
      return;
    }

    // Get token
    let authToken = token;
    if (!authToken) {
      authToken = AuthService.getToken() || '';
      setToken(authToken);
    }

    // Clean token (remove Bearer if present)
    let cleanToken = authToken;
    if (authToken && authToken.startsWith('Bearer ')) {
      cleanToken = authToken.substring(7);
    }

    addLog(`Sending authentication with token`);
    socket.emit('authenticate', { token: cleanToken });
  };

  // Subscribe to phishing attempts
  const subscribeToAttempts = () => {
    if (!socket || !connected) {
      addLog('Cannot subscribe - socket not connected');
      return;
    }

    addLog('Subscribing to phishing attempts');
    socket.emit('subscribeToPhishingAttempts');
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">WebSocket Connection Test</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={connectSocket}
          disabled={!!socket}
          className={`px-4 py-2 rounded ${
            socket ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Connect Socket
        </button>

        <button
          onClick={disconnectSocket}
          disabled={!socket}
          className={`px-4 py-2 rounded ${
            !socket ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          Disconnect Socket
        </button>

        <button
          onClick={sendAuthentication}
          disabled={!socket || !connected}
          className={`px-4 py-2 rounded ${
            !socket || !connected ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          Send Authentication
        </button>

        <button
          onClick={subscribeToAttempts}
          disabled={!socket || !connected || !authenticated}
          className={`px-4 py-2 rounded ${
            !socket || !connected || !authenticated ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          Subscribe to Updates
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{connected ? 'Connected' : 'Disconnected'}</span>

          <div className="ml-4 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${authenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{authenticated ? 'Authenticated' : 'Not Authenticated'}</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">JWT Token</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-2 border rounded text-sm font-mono"
          placeholder="JWT Token"
        />
      </div>

      <div className="border rounded p-2 bg-gray-50 h-96 overflow-auto">
        <h2 className="font-bold mb-2">Socket Logs</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet. Connect socket to begin testing.</p>
        ) : (
          <div className="space-y-1 font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="border-b pb-1">{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocketTest;
