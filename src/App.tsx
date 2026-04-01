import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import AIChatWidget from './components/AIChatWidget';

export default function App() {
  return (
    <AuthProvider>
      <LandingPage />
      <AIChatWidget />
    </AuthProvider>
  );
}
