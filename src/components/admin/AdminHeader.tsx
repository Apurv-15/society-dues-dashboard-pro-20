
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { LogOut, User } from 'lucide-react';

interface AdminHeaderProps {
  onLogout?: () => void;
}

export const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  const { user, logout } = useAuthStore();
  
  const handleLogout = async () => {
    console.log('AdminHeader logout clicked');
    if (onLogout) {
      onLogout();
    } else {
      await logout();
    }
  };
  
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <img 
                alt="Highland Residency Cultural Association" 
                className="w-8 h-8 object-contain" 
                src="/lovable-uploads/6016a9df-9143-489d-be05-0ac72553f761.png" 
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Highland Residency Cultural Association
              </h1>
              <p className="text-sm text-gray-600">Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Welcome, {user?.name}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
