import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PatientProvider } from './contexts/PatientContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PatientProvider>
          <AppRoutes />
        </PatientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;