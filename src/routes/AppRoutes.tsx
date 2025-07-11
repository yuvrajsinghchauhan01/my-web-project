import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import NewPatientForm from '../pages/NewPatientForm';
import CalibrationAnnotation from '../pages/CalibrationAnnotation';
import BoneAnnotation from '../pages/BoneAnnotation';
import ImplantTemplating from '../pages/ImplantTemplating';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/patient/new" element={
        <ProtectedRoute>
          <NewPatientForm />
        </ProtectedRoute>
      } />
      
      <Route path="/patient/:patientId/calibration" element={
        <ProtectedRoute>
          <CalibrationAnnotation />
        </ProtectedRoute>
      } />
      
      <Route path="/patient/:patientId/bone-annotation" element={
        <ProtectedRoute>
          <BoneAnnotation />
        </ProtectedRoute>
      } />
      
      <Route path="/patient/:patientId/implant-templating" element={
        <ProtectedRoute>
          <ImplantTemplating />
        </ProtectedRoute>
      } />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;