import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';
import BoneAnnotationComponent from '../components/BoneAnnotation';

const BoneAnnotation: React.FC = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { patientData, updatePatientData } = usePatient();

  const handleBack = () => {
    navigate(`/patient/${patientId}/calibration`);
  };

  const handleSave = (boneData: any) => {
    updatePatientData(boneData);
  };

  const handleNext = (boneData: any) => {
    updatePatientData(boneData);
    navigate(`/patient/${patientId}/implant-templating`);
  };

  return (
    <BoneAnnotationComponent 
      onBack={handleBack}
      onSave={handleSave}
      onNext={handleNext}
      patientData={patientData}
    />
  );
};

export default BoneAnnotation;