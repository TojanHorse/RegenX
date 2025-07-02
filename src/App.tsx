import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Auth from './components/Auth';
import Chat from './components/Chat';
import RegenX from './components/RegenX';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('regenx'); // Start with RegenX blog
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Only show content based on current view */}
      {currentView === 'regenx' && (
        <RegenX onTriggerAuth={() => setShowAuthModal(true)} />
      )}
      
      {currentView === 'chat' && user && (
        <SocketProvider>
          <Chat />
        </SocketProvider>
      )}

      {/* Auth Modal - only shows when triggered */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            <Auth onAuthSuccess={() => {
              setShowAuthModal(false);
              setCurrentView('chat');
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;