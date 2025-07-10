import React, { useState } from 'react';
import { Home, User } from 'lucide-react';

interface ImplantTemplatingProps {
  onBack: () => void;
  onSave: () => void;
  patientData: {
    patientId: string;
    firstName: string;
    lastName: string;
    apXrayImage: string | null;
    latXrayImage: string | null;
    apRotation?: number;
    latRotation?: number;
    apPolygon?: any;
    latPolygon?: any;
    apAdjustment?: any;
    latAdjustment?: any;
  };
}

const ImplantTemplating: React.FC<ImplantTemplatingProps> = ({ onBack, onSave, patientData }) => {
  const [selectedBonePlates, setSelectedBonePlates] = useState({
    femur: 'none',
    tibia: 'none',
    ankle: 'none',
    hip: 'none',
    clavicle: 'none',
    radius: 'none',
    humerus: 'none',
    smallbones: 'none'
  });

  const handleBonePlateChange = (bone: string, value: string) => {
    setSelectedBonePlates(prev => ({
      ...prev,
      [bone]: value
    }));
  };

  const boneOptions = [
    'none',
    'Plate A',
    'Plate B', 
    'Plate C',
    'Plate D',
    'Plate E'
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

          {/* Right side - Navigation */}
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

      {/* Main Content */}
      <div className="px-8 py-8">
        {/* Header with title and buttons */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">Implant Templating</h2>
          <div className="flex space-x-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-2xl border border-gray-300 transition-all duration-300"
            >
              Back
            </button>
            <button
              onClick={onSave}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all duration-300"
            >
              Save
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[750px] overflow-hidden">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 overflow-scroll h-full rounded-3xl overflow-scroll">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 shadow-lg text-white">
              {/* Case Details */}
              <div className="bg-white/20 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Case Details</h3>
                <div className="space-y-2 text-sm">
                  <p>Patient ID: <span className="font-medium">{patientData.patientId}</span></p>
                  <p>Name: <span className="font-medium">{patientData.firstName} {patientData.lastName}</span></p>
                </div>
                <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm transition-colors duration-200">
                  Edit / Add Details
                </button>
              </div>

              {/* Bone Plate Selection */}
              <div className="space-y-6">
                <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors duration-200">
                  Select Bone Plate
                </button>

                {/* Bone Selection Dropdowns */}
                <div className="space-y-4">
                  {Object.entries(selectedBonePlates).map(([bone, value]) => (
                    <div key={bone} className="flex items-center justify-between">
                      <label className="text-sm font-medium capitalize text-white">
                        {bone}:
                      </label>
                      <select
                        value={value}
                        onChange={(e) => handleBonePlateChange(bone, e.target.value)}
                        className="px-3 py-1 bg-white/20 border border-white/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem'
                        }}
                      >
                        {boneOptions.map((option) => (
                          <option key={option} value={option} className="bg-gray-800 text-white">
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Help Text */}
                <div className="bg-white/10 rounded-xl p-4 text-xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <span className="text-xs">?</span>
                    </div>
                  </div>
                  <p>Select appropriate bone plates for each bone segment. The selected plates will be overlaid on the X-ray images for templating.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns - X-Ray Images with Cropped Bone Segments */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* AP X-Ray - Cropped Bone Segment */}
            <div className="bg-black rounded-3xl overflow-hidden shadow-lg relative">
              <div
                className="aspect-[3/4] bg-black relative"
                style={{
                  backgroundImage: patientData.apXrayImage
                    ? `url("${patientData.apXrayImage}")`
                    : 'url("")',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  transform: `rotate(${patientData.apRotation || 0}deg)`,
                  width: '100%',
                  height: '100%',
                  
                }}
              >
                {/* Render the bone annotation if available */}
                {patientData.apPolygon && patientData.apAdjustment && (
                  <>
                    {/* Semi-transparent mask for original area */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <polygon 
                        points={patientData.apPolygon.points?.map((p: any) => `${p.x},${p.y}`).join(' ')}
                        fill="rgba(0,0,0,0.7)" 
                      />
                    </svg>
                    
                    {/* Cropped and adjusted bone segment */}
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        clipPath: `polygon(${patientData.apPolygon.points?.map((p: any) => `${p.x}% ${p.y}%`).join(', ')})`,
                        backgroundImage: `url("${patientData.apXrayImage}")`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        transform: `
                          translate(${patientData.apAdjustment.x}px, ${patientData.apAdjustment.y}px)
                          rotate(${patientData.apAdjustment.rotation}deg)
                          scale(${patientData.apAdjustment.scale})
                        `,
                        transformOrigin: `${patientData.apPolygon.points?.reduce((acc: any, p: any) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 }).x / patientData.apPolygon.points?.length || 50}% ${patientData.apPolygon.points?.reduce((acc: any, p: any) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 }).y / patientData.apPolygon.points?.length || 50}%`,
                        zIndex: 10
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            {/* ML X-Ray - Cropped Bone Segment */}
            <div className="bg-black rounded-3xl overflow-hidden shadow-lg relative">
              <div
                className="aspect-[3/4] bg-black relative"
                style={{
                  backgroundImage: patientData.latXrayImage
                    ? `url("${patientData.latXrayImage}")`
                    : 'url("")',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  transform: `rotate(${patientData.latRotation || 0}deg)`,
                  width: '100%',
                  height: '100%',
                }}
              >
                {/* Render the bone annotation if available */}
                {patientData.latPolygon && patientData.latAdjustment && (
                  <>
                    {/* Semi-transparent mask for original area */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <polygon 
                        points={patientData.latPolygon.points?.map((p: any) => `${p.x},${p.y}`).join(' ')}
                        fill="rgba(0,0,0,0.7)" 
                      />
                    </svg>
                    
                    {/* Cropped and adjusted bone segment */}
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        clipPath: `polygon(${patientData.latPolygon.points?.map((p: any) => `${p.x}% ${p.y}%`).join(', ')})`,
                        backgroundImage: `url("${patientData.latXrayImage}")`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        transform: `
                          translate(${patientData.latAdjustment.x}px, ${patientData.latAdjustment.y}px)
                          rotate(${patientData.latAdjustment.rotation}deg)
                          scale(${patientData.latAdjustment.scale})
                        `,
                        transformOrigin: `${patientData.latPolygon.points?.reduce((acc: any, p: any) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 }).x / patientData.latPolygon.points?.length || 50}% ${patientData.latPolygon.points?.reduce((acc: any, p: any) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 }).y / patientData.latPolygon.points?.length || 50}%`,
                        zIndex: 10
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImplantTemplating;