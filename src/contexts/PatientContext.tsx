import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PatientData {
  patientId: string;
  firstName: string;
  lastName: string;
  age?: string;
  city?: string;
  appointmentDate?: string;
  gender?: string;
  description?: string;
  apXrayImage: string | null;
  latXrayImage: string | null;
  apRotation: number;
  latRotation: number;
  apPolygon: any;
  latPolygon: any;
  apAdjustment: any;
  latAdjustment: any;
}

interface PatientContextType {
  patientData: PatientData;
  updatePatientData: (data: Partial<PatientData>) => void;
  resetPatientData: () => void;
}

const defaultPatientData: PatientData = {
  patientId: '',
  firstName: '',
  lastName: '',
  apXrayImage: null,
  latXrayImage: null,
  apRotation: 0,
  latRotation: 0,
  apPolygon: null,
  latPolygon: null,
  apAdjustment: null,
  latAdjustment: null
};

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

interface PatientProviderProps {
  children: ReactNode;
}

export const PatientProvider: React.FC<PatientProviderProps> = ({ children }) => {
  const [patientData, setPatientData] = useState<PatientData>(defaultPatientData);

  const updatePatientData = (data: Partial<PatientData>) => {
    setPatientData(prev => ({ ...prev, ...data }));
  };

  const resetPatientData = () => {
    setPatientData(defaultPatientData);
  };

  return (
    <PatientContext.Provider value={{ patientData, updatePatientData, resetPatientData }}>
      {children}
    </PatientContext.Provider>
  );
};