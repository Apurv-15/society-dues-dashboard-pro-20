
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Plus, BarChart3, Settings, Users, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const SidebarNavigation = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navigationItems = [
    {
      title: 'Dashboard',
      icon: BarChart3,
      path: '/admin',
      badge: null,
    },
    {
      title: 'Add Entry',
      icon: Plus,
      path: '/admin/add',
      badge: null,
    },
    {
      title: 'Manage',
      icon: Settings,
      path: '/admin/manage',
      badge: null,
    },
    {
      title: 'Analytics',
      icon: Users,
      path: '/admin/analytics',
      badge: null,
    },
  ];

  return (
    <div className={cn(
      "fixed left-0 top-0 z-50 h-full transition-all duration-300 ease-in-out",
      "bg-white/10 backdrop-blur-xl border-r border-white/20",
      "shadow-xl",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          isCollapsed && "justify-center"
        )}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <img 
              src="/lovable-uploads/6016a9df-9143-489d-be05-0ac72553f761.png" 
              alt="Highland Residency Cultural Association" 
              className="w-6 h-6 object-contain"
            />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-800">Society</h2>
              <p className="text-xs text-gray-600">Management</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-gray-700" />
          ) : (
            <X className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                "hover:bg-white/20 hover:shadow-lg",
                isActive && "bg-white/30 text-blue-700 shadow-lg",
                !isActive && "text-gray-700 hover:text-gray-900",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive && "text-blue-600"
              )} />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{item.title}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                <img 
                  src="/lovable-uploads/6016a9df-9143-489d-be05-0ac72553f761.png" 
                  alt="Highland Residency Cultural Association" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Admin</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
