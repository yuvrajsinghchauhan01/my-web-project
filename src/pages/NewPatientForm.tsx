import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';
import NewPatientFormComponent from '../components/NewPatientForm';

const NewPatientForm: React.FC = () => {
  const navigate = useNavigate();
  const { updatePatientData } = usePatient();

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSave = (data: any) => {
    const patientId = data.patientId || Date.now().toString();
    
    updatePatientData({
      patientId,
      firstName: data.firstName || 'Deepak',
      lastName: data.lastName || 'Kumar',
      age: data.age,
      city: data.city,
      appointmentDate: data.appointmentDate,
      gender: data.gender,
      description: data.description,
      apXrayImage: data.apXrayImage || null,
      latXrayImage: data.latXrayImage || null,
      apRotation: 0,
      latRotation: 0,
      apPolygon: null,
      latPolygon: null,
      apAdjustment: null,
      latAdjustment: null
    });
    
    navigate(`/patient/${patientId}/calibration`);
  };

  return <NewPatientFormComponent onBack={handleBack} onSave={handleSave} />;
};

export default NewPatientForm;