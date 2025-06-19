import React from 'react';
import { Play, Library, Settings, User, ArrowLeft, Upload, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface NavigationProps {
  currentView: 'library' | 'player';
  onViewChange: (view: 'library' | 'player') => void;
  onBack: () => void;
  showBack: boolean;
  onUpload?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  onBack,
  showBack,
  onUpload
}) => {
  const { user, logout } = useAuthStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBack ? (
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            ) : null}
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">StreamEdit Pro</h1>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => onViewChange('library')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentView === 'library'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Library</span>
            </button>

            {onUpload && (
              <button
                onClick={onUpload}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
            )}

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white text-sm font-medium">{user?.name}</span>
              <button
                onClick={logout}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};