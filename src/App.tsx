import React, { useState } from 'react';
import Logo from './components/Logo';
import Hero from './components/Hero';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import NewPatientForm from './components/NewPatientForm';
import CalibrationAnnotation from './components/CalibrationAnnotation';
import BoneAnnotation from './components/BoneAnnotation';
import ImplantTemplating from './components/ImplantTemplating';

function App() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'newPatient' | 'calibration' | 'boneAnnotation' | 'implantTemplating'>('dashboard');
  const [patientData, setPatientData] = useState({
    patientId: '',
    firstName: '',
    lastName: '',
    apXrayImage: null as string | null,
    latXrayImage: null as string | null,
    apRotation: 0,
    latRotation: 0
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleNewCase = () => {
    setCurrentView('newPatient');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleSavePatient = (data: any) => {
    setPatientData({
      patientId: data.patientId || '12345',
      firstName: data.firstName || 'Deepak',
      lastName: data.lastName || 'Kumar',
      apXrayImage: data.apXrayImage || null,
      latXrayImage: data.latXrayImage || null,
      apRotation: 0,
      latRotation: 0
    });
    setCurrentView('calibration');
  };

  const handleUpdatePatientImages = (apImage: string | null, latImage: string | null, apRotation?: number, latRotation?: number) => {
    setPatientData(prev => ({
      ...prev,
      apXrayImage: apImage,
      latXrayImage: latImage,
      apRotation: apRotation || prev.apRotation,
      latRotation: latRotation || prev.latRotation
    }));
  };
  const handleCalibrationNext = () => {
    setCurrentView('boneAnnotation');
  };

  const handleBoneAnnotationSave = () => {
    setCurrentView('implantTemplating');
  };

  const handleImplantTemplatingSave = () => {
    // Handle final save and return to dashboard
    setCurrentView('dashboard');
  };

  if (isLoggedIn) {
    if (currentView === 'implantTemplating') {
      return (
        <ImplantTemplating 
          onBack={() => setCurrentView('boneAnnotation')}
          onSave={handleImplantTemplatingSave}
          patientData={patientData}
        />
      );
    }
    
    if (currentView === 'boneAnnotation') {
      return (
        <BoneAnnotation 
          onBack={() => setCurrentView('calibration')}
          onSave={handleBoneAnnotationSave}
          onNext={handleBoneAnnotationSave}
          patientData={patientData}
        />
      );
    }
    
    if (currentView === 'calibration') {
      return (
        <CalibrationAnnotation 
          onBack={handleBackToDashboard}
          onNext={handleCalibrationNext}
          patientData={patientData}
          onUpdateImages={handleUpdatePatientImages}
        />
      );
    }
    
    if (currentView === 'newPatient') {
      return <NewPatientForm onBack={handleBackToDashboard} onSave={handleSavePatient} />;
    }
    
    return <Dashboard onNewCase={handleNewCase} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/3844581/pexels-photo-3844581.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop")',
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        <Logo />
        
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
}

export default App;