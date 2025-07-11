import React from 'react';
import { Plus, Home, User, ChevronRight, Minus, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onNewCase: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewCase }) => {
  const emergencyCases = [
    {
      id: '#20348',
      name: 'Deepak Kumar',
      roomNo: '207',
      fracture: 'Compound'
    },
    {
      id: '#20348',
      name: 'Deepak Kumar',
      roomNo: '207',
      fracture: 'Compound'
    },
    {
      id: '#20348',
      name: 'Deepak Kumar',
      roomNo: '207',
      fracture: 'Compound'
    }
  ];

  const todaysAppointments = [
    {
      time: '10:20 AM',
      id: '#20348',
      name: 'Deepak Kumar'
    },
    {
      time: '10:40 AM',
      id: '#20348',
      name: 'Deepak Kumar'
    },
    {
      time: '11:00 AM',
      id: '#20348',
      name: 'Deepak Kumar'
    },
    {
      time: '11:20 AM',
      id: '#20348',
      name: 'Deepak Kumar'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-8 py-6">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <span className="text-white text-xl font-bold">Meril</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">More to Life</p>
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-wide">
              MERIL - ATS
            </h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onNewCase}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Plus size={20} />
              <span className="font-medium">New case</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button className="flex flex-col items-center justify-center w-16 h-16 bg-blue-100 hover:bg-blue-200 rounded-full transition-all duration-300">
                <Home size={24} className="text-blue-600" />
                <span className="text-xs text-blue-600 mt-1">Home</span>
              </button>
              
              <button className="flex flex-col items-center justify-center w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300">
                <User size={24} className="text-gray-600" />
                <span className="text-xs text-gray-600 mt-1">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats and Emergency Cases */}
          <div className="lg:col-span-2 space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ongoing Cases */}
              <div className="bg-gradient-to-br from-orange-200 to-orange-300 rounded-3xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-400 rounded-full p-2">
                    <Minus size={20} className="text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-red-600 mb-2">2345</div>
                <div className="text-gray-700 font-medium">Ongoing Cases</div>
              </div>

              {/* Closed Cases */}
              <div className="bg-gradient-to-br from-green-200 to-green-300 rounded-3xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500 rounded-full p-2">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-2">8765</div>
                <div className="text-gray-700 font-medium">Closed Cases</div>
              </div>

              {/* New Cases */}
              <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-3xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500 rounded-full p-2">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">45</div>
                <div className="text-gray-700 font-medium">New Cases</div>
              </div>
            </div>

            {/* Emergency Cases */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-semibold text-blue-600 mb-6">Emergency Cases</h2>
              
              <div className="overflow-hidden">
                <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium text-gray-600 border-b border-gray-200 pb-3">
                  <div>Patient Details</div>
                  <div>Room No.</div>
                  <div>Fracture</div>
                  <div></div>
                </div>
                
                <div className="space-y-4">
                  {emergencyCases.map((case_, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 items-center py-4 border-b border-gray-100 last:border-b-0">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">{case_.id}</div>
                        <div className="font-semibold text-gray-800">{case_.name}</div>
                      </div>
                      <div className="font-semibold text-gray-800">{case_.roomNo}</div>
                      <div>
                        <span className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                          {case_.fracture}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                          <ChevronRight size={20} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Today's Appointments */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 h-fit">
              <h2 className="text-2xl font-semibold text-blue-600 mb-8">Today's Appointment</h2>
              
              <div className="space-y-6">
                {todaysAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="text-gray-600 font-medium min-w-[80px]">
                      {appointment.time}
                    </div>
                    <div className="w-px h-12 bg-gray-300"></div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">{appointment.id}</div>
                      <div className="font-semibold text-gray-800">{appointment.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;