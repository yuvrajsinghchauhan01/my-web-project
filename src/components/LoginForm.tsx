import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Apple } from 'lucide-react';

interface LoginFormProps {
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
  onLogin: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ activeTab, onTabChange, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSocialAuth, setShowSocialAuth] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const handleSocialAuth = (provider: string) => {
    console.log(`Authenticating with ${provider}`);
  };

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
  return (
    <div className="backdrop-blur-md bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white tracking-wider mb-2">
          MERIL - ATS
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-8 bg-white/5 rounded-full p-1 border border-white/10">
        <button
          onClick={() => onTabChange('login')}
          className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all duration-300 ${
            activeTab === 'login'
              ? 'bg-white text-gray-900 shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          Log In
        </button>
        <button
          onClick={() => onTabChange('signup')}
          className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all duration-300 ${
            activeTab === 'signup'
              ? 'bg-white text-gray-900 shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'login' ? (
        <>
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Id"
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Login
            </button>
          </form>

          <div className="text-center mt-6">
            <a
              href="#"
              className="text-white/70 hover:text-white text-sm transition-colors duration-200"
            >
              Forgot password?
            </a>
          </div>
        </>
      ) : (
        <>
          {/* Sign Up Social Options */}
          <div className="space-y-4">
            {/* Continue with Google */}
            <button
              onClick={() => handleSocialAuth('Google')}
              className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            {/* Continue with Apple */}
            <button
              onClick={() => handleSocialAuth('Apple')}
              className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3"
            >
              <Apple size={20} />
              <span>Continue with Apple</span>
            </button>

            {/* Continue with Email */}
            <button
              onClick={() => handleSocialAuth('Email')}
              className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3"
            >
              <Mail size={20} />
              <span>Continue with Email</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginForm;