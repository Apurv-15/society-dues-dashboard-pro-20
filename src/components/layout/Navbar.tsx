
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Calendar, Users, Info, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  onSignInClick?: () => void;
}

export const Navbar = ({ onSignInClick }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Add debugging logs for auth state
  useEffect(() => {
    console.log('Navbar auth state:', { isAuthenticated, user: user?.name, loading });
  }, [isAuthenticated, user, loading]);

  const navItems = [
    { name: 'Home', icon: Home, action: () => scrollToSection('#home') },
    { name: 'Events', icon: Calendar, action: () => scrollToSection('#events') },
  ];

  const scrollToSection = (href: string) => {
    // If we're not on the home page, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  const handleLogout = async () => {
    console.log('Logout initiated from navbar');
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleDashboard = () => {
    console.log('Dashboard navigation initiated');
    navigate('/dashboard');
    setIsOpen(false);
  };

  const handleHome = () => {
    // Navigate to homepage without logging out
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
    setIsOpen(false);
  };

  const handleSignIn = () => {
    console.log('Sign in clicked from navbar');
    if (onSignInClick) {
      onSignInClick();
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={handleHome}>
            <h1 className="text-xl font-bold text-gray-800">Highland Residency</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              ))}
              
              {/* Dashboard Tab - Only show when authenticated */}
              {!loading && isAuthenticated && (
                <button
                  onClick={handleDashboard}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
              )}
            </div>

            {/* Authentication Section */}
            {!loading && isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden lg:inline">Welcome, {user?.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{user?.name || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : !loading ? (
              <Button 
                onClick={handleSignIn}
                className="bg-indigo-500 px-4 py-2 font-medium hover:bg-indigo-400"
                size="sm"
              >
                Sign In
              </Button>
            ) : (
              <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/90 backdrop-blur-md rounded-lg mt-2 border border-white/20">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="flex items-center gap-2 w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              ))}
              
              {/* Mobile Dashboard Tab - Only show when authenticated */}
              {!loading && isAuthenticated && (
                <button
                  onClick={handleDashboard}
                  className="flex items-center gap-2 w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
              )}
              
              {/* Mobile Authentication */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {!loading && isAuthenticated ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-sm text-gray-600">
                      Welcome, {user?.name}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : !loading ? (
                  <Button 
                    onClick={handleSignIn}
                    className="w-full bg-indigo-500 hover:bg-indigo-400"
                  >
                    Sign In
                  </Button>
                ) : (
                  <div className="w-full h-10 bg-gray-200 animate-pulse rounded"></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
