
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Home, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  redirectTo?: 'registration' | null;
  eventId?: string;
  onShowRegister?: () => void;
}

export const LoginForm = ({
  redirectTo,
  eventId,
  onShowRegister
}: LoginFormProps) => {
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const {
    loginWithGoogle,
    loginWithPassword,
    setUser,
    isAuthenticated
  } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      if (redirectTo === 'registration') {
        // Trigger registration form opening
        window.dispatchEvent(new CustomEvent('openRegistration', {
          detail: { eventId }
        }));
      } else {
        // Navigate directly to dashboard
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, redirectTo, eventId, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Login Successful",
        description: "Welcome to Highland Residency Cultural Association"
      });
      // Navigation will be handled by useEffect
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Google login is not available in preview mode. Please use the development login options below.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    setPasswordLoading(true);
    try {
      await loginWithPassword(email, password);
      toast({
        title: "Login Successful",
        description: "Welcome to Highland Residency Cultural Association"
      });
      // Navigation will be handled by useEffect
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDevLogin = (role: 'admin' | 'user') => {
    console.log(`Attempting dev login as ${role}...`);
    const mockUser = {
      id: role === 'admin' ? 'dev-admin-1' : 'dev-user-1',
      name: role === 'admin' ? 'Dev Admin' : 'Dev User',
      email: role === 'admin' ? 'admin@dev.com' : 'user@dev.com',
      role,
      isActive: true,
      buildingNo: role === 'user' ? 1 : undefined,
      flatNo: role === 'user' ? '101' : undefined
    };
    console.log('Mock user created:', mockUser);

    setUser(mockUser);
    console.log('User set in store, checking auth state...');
    const authState = useAuthStore.getState();
    console.log('Current auth state:', authState);
    toast({
      title: "Development Login Successful",
      description: `Logged in as ${role}`
    });
    // Navigation will be handled by useEffect
  };

  const handleGoHome = () => {
    window.location.reload();
  };

  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      {/* Go to Home Page Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button onClick={handleGoHome} variant="outline" size="sm" className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Go to Home Page
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <img alt="Highland Residency Cultural Association" className="w-12 h-12 object-contain" src="https://greffon.sirv.com/Greffon/pngegg.png" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Highland Residency Cultural Association
          </CardTitle>
          <CardDescription className="text-gray-600">
            {redirectTo === 'registration' ? 'Please sign in to register for the event' : 'Sign in to access cultural events and manage your account'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Email/Password Login Form - Hidden but kept for future use */}
          <form onSubmit={handlePasswordLogin} className="space-y-4" style={{ display: 'none' }}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" disabled={passwordLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" disabled={passwordLoading} />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={passwordLoading}>
              {passwordLoading ? <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Signing in...
                </div> : "Sign In"}
            </Button>
          </form>

          {/* Divider - Hidden since manual login is hidden */}
          <div className="relative" style={{ display: 'none' }}>
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button onClick={handleGoogleLogin} className="w-full h-12 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors" disabled={loading}>
            {loading ? <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                Signing in...
              </div> : <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </div>}
          </Button>

          {/* Development Login Options - Hidden but kept for future use */}
          <div className="border-t pt-4" style={{ display: 'none' }}>
            <p className="text-sm text-gray-500 mb-3 text-center">Development Only</p>
            <div className="space-y-2">
              <Button onClick={() => handleDevLogin('admin')} variant="outline" className="w-full">
                Skip Login as Admin
              </Button>
              <Button onClick={() => handleDevLogin('user')} variant="outline" className="w-full">
                Skip Login as User
              </Button>
            </div>
          </div>

          {/* Create Account Section - Hidden but kept for future use */}
          {onShowRegister && <div className="border-t pt-4" style={{ display: 'none' }}>
              <p className="text-sm text-gray-500 mb-3 text-center">
                Don't have an account?
              </p>
              <Button onClick={onShowRegister} variant="outline" className="w-full">
                Create Account
              </Button>
            </div>}

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">📋 Quick Setup:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Login with your Google account</li>
              <li>• Building & flat details collected when needed</li>
              <li>• Access donation receipts after setup</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>;
};
