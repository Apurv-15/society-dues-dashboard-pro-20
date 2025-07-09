
import { useState, useEffect } from 'react';
import { SimpleHeroSection } from '@/components/hero/SimpleHeroSection';
import { AuthManager } from '@/components/auth/AuthManager';
import { useAuthStore } from '@/store/authStore';
import { useDonationStore } from '@/store/donationStore';
import { Toaster } from '@/components/ui/toaster';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, isAuthenticated, loading, checkAuthState } = useAuthStore();
  const { initializeFirebase, isLoading } = useDonationStore();
  const navigate = useNavigate();
  const [appLoading, setAppLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState<{type: 'registration' | 'dashboard', eventId: string} | null>(null);

  // Redirect authenticated users based on their role - this should be the primary redirection logic
  useEffect(() => {
    if (isAuthenticated && user && !appLoading && !loading) {
      console.log('User is authenticated, checking role for redirect:', user.role);
      
      // Add a small delay to ensure all state is properly set
      setTimeout(() => {
        if (user.role === 'admin') {
          console.log('Admin user detected, redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('Regular user detected, redirecting to user dashboard');
          navigate('/dashboard');
        }
      }, 100);
    }
  }, [isAuthenticated, user, navigate, appLoading, loading]);

  useEffect(() => {
    const initialize = async () => {
      console.log('Initializing Index component...');
      checkAuthState();
      await initializeFirebase();
      setAppLoading(false);
      console.log('Index initialization complete');
    };

    initialize();

    // Listen for registration redirect events
    const handleRegistrationRedirect = (event: CustomEvent) => {
      console.log('Registration redirect event received:', event.detail);
      if (!isAuthenticated) {
        setLoginRedirect({ type: 'dashboard', eventId: event.detail.eventId });
        setShowLogin(true);
      }
    };

    // Listen for auth success to close login and clear redirect
    const handleAuthSuccess = () => {
      console.log('Auth success received in Index component');
      setShowLogin(false);
      // Keep the redirect info briefly to allow other components to handle it
      setTimeout(() => {
        setLoginRedirect(null);
      }, 500);
    };

    window.addEventListener('registrationRedirect', handleRegistrationRedirect as EventListener);
    window.addEventListener('authSuccess', handleAuthSuccess);

    return () => {
      window.removeEventListener('registrationRedirect', handleRegistrationRedirect as EventListener);
      window.removeEventListener('authSuccess', handleAuthSuccess);
    };
  }, [checkAuthState, initializeFirebase, isAuthenticated]);

  // Add debugging logs
  useEffect(() => {
    console.log('Index component state:', {
      appLoading,
      loading,
      isLoading,
      isAuthenticated,
      user: user ? { id: user.id, role: user.role } : null
    });
  }, [appLoading, loading, isLoading, isAuthenticated, user]);

  if (appLoading || loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  if (showLogin) {
    console.log('Showing AuthManager with redirect:', loginRedirect);
    return (
      <>
        <AuthManager 
          redirectTo={loginRedirect?.type || null} 
          eventId={loginRedirect?.eventId}
        />
        <Toaster />
      </>
    );
  }

  // Show simplified hero section for all users (authenticated and non-authenticated)
  return (
    <div className="relative">
      <SimpleHeroSection onSignInClick={() => setShowLogin(true)} />
      <Toaster />
    </div>
  );
};

export default Index;
