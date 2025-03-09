import { Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import PhishingSimulation from './components/PhishingSimulation';
import PhishingAttemptsList from './components/PhishingAttemptsList';
import ErrorBoundary from './components/ErrorBoundary';
import { Suspense } from 'react';
import SocketTest from './components/SocketTest';

// Configure React Query with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Add error handling for mutations too
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  },
});

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
  </div>
);

export function App() {
  console.log('App component rendering');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
          <ToastContainer position="top-right" autoClose={3000} />
          <ErrorBoundary>
            <Navbar />
          </ErrorBoundary>
          <main className="container mx-auto px-4 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/socket-test"
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <SocketTest />
                      </ErrorBoundary>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/phishing-simulation"
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <PhishingSimulation />
                      </ErrorBoundary>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/phishing-attempts"
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <PhishingAttemptsList />
                      </ErrorBoundary>
                    </PrivateRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
                {/* Add a catch-all route for 404 */}
                <Route path="*" element={
                  <div className="text-center py-10">
                    <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
                    <p>The page you are looking for doesn't exist.</p>
                  </div>
                } />
              </Routes>
            </Suspense>
          </main>
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
