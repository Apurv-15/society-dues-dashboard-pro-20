
import { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useNavigate } from 'react-router-dom';

interface AuthManagerProps {
  redirectTo?: 'registration' | 'dashboard' | null;
  eventId?: string;
}

export const AuthManager = ({ redirectTo, eventId }: AuthManagerProps) => {
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  // Handle post-login navigation and registration redirect
  useEffect(() => {
    if (redirectTo && eventId) {
      // Listen for successful authentication
      const handleAuthSuccess = () => {
        console.log('Auth success detected, navigating to dashboard and opening registration for eventId:', eventId);
        
        // Store event ID for registration
        sessionStorage.setItem('pendingRegistrationEventId', eventId);
        
        // Navigate to dashboard regardless of redirectTo value
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      };

      // Listen for successful authentication
      window.addEventListener('authSuccess', handleAuthSuccess);
      
      return () => {
        window.removeEventListener('authSuccess', handleAuthSuccess);
      };
    }
  }, [redirectTo, eventId, navigate]);

  if (showRegister) {
    return (
      <RegisterForm
        onSuccess={() => setShowRegister(false)}
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <LoginForm
      redirectTo={redirectTo}
      eventId={eventId}
      onShowRegister={() => setShowRegister(true)}
    />
  );
};
