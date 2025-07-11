import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardComponent from '../components/Dashboard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleNewCase = () => {
    navigate('/patient/new');
  };

  return <DashboardComponent onNewCase={handleNewCase} />;
};

export default Dashboard;