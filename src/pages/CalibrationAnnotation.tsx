import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';
import CalibrationAnnotationComponent from '../components/CalibrationAnnotation';

const CalibrationAnnotation: React.FC = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { patientData, updatePatientData } = usePatient();

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleNext = () => {
    navigate(`/patient/${patientId}/bone-annotation`);
  };

  const handleUpdateImages = (apImage: string | null, latImage: string | null, apRotation?: number, latRotation?: number) => {
    updatePatientData({
      apXrayImage: apImage,
      latXrayImage: latImage,
      apRotation: apRotation || patientData.apRotation,
      latRotation: latRotation || patientData.latRotation
    });
  };

  return (
    <CalibrationAnnotationComponent 
      onBack={handleBack}
      onNext={handleNext}
      patientData={patientData}
      onUpdateImages={handleUpdateImages}
    />
  );
};

export default CalibrationAnnotation;