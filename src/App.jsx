import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import { AuthManager } from './utils/security';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Initialize auth and check current user
    const initAuth = async () => {
      try {
        await AuthManager.initialize();
        setIsAuthenticated(AuthManager.isAuthenticated());
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setAuthLoading(false);
      }
    };
    
    initAuth();

    // Listen for auth state changes
    const unsubscribe = AuthManager.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          {!isAuthenticated ? (
            <LoginForm onSuccess={handleLoginSuccess} />
          ) : (
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </Layout>
          )}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#059669',
                  color: '#fff',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#dc2626',
                  color: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;