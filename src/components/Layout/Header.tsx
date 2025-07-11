import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-100">
      <div className="flex items-center justify-between px-8 py-6">
        {/* Left side - Logo and Title */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <span className="text-white text-xl font-bold">Meril</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">More to Life</p>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 tracking-wide">
            MERIL - ATS
          </h1>
        </div>

        {/* Right side - Navigation */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleHomeClick}
            className="flex flex-col items-center justify-center w-16 h-16 bg-blue-100 hover:bg-blue-200 rounded-full transition-all duration-300"
          >
            <Home size={24} className="text-blue-600" />
            <span className="text-xs text-blue-600 mt-1">Home</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300"
          >
            <User size={24} className="text-gray-600" />
            <span className="text-xs text-gray-600 mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;