import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';
import ImplantTemplatingComponent from '../components/ImplantTemplating';

const ImplantTemplating: React.FC = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { patientData, resetPatientData } = usePatient();

  const handleBack = () => {
    navigate(`/patient/${patientId}/bone-annotation`);
  };

  const handleSave = () => {
    // Save the final templating data
    // You can add API calls here to save to backend
    
    // Reset patient data and return to dashboard
    resetPatientData();
    navigate('/dashboard');
  };

  return (
    <ImplantTemplatingComponent 
      onBack={handleBack}
      onSave={handleSave}
      patientData={patientData}
    />
  );
};

export default ImplantTemplating;