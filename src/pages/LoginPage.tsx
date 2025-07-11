import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import Hero from '../components/Hero';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    login();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-[url('src/images/sign_in_background.png')] bg-no-repeat"
      />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        <div>
          <img src={"src/images/meril.png"} alt="Logo" className="w-20 h-22 fixed top-8 left-8 z-10" />
        </div>
        
        {/* Left Side - Hero Text */}
        <Hero />
        
        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <LoginForm 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onLogin={handleLogin}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;