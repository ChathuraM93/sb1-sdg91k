import React from 'react';
import { UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { currentUser, userRole, isOnline } = useAuth();

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Call Center Platform</h1>
        <div className="flex items-center space-x-4">
          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
          <span className="flex items-center">
            <UserCircle className="mr-2" />
            {currentUser?.email} ({userRole})
          </span>
          <button
            onClick={onLogout}
            className="flex items-center bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
          >
            <LogOut className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;