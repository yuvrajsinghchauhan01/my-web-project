import React, { useState } from 'react';
import { Camera, Upload, Home, User, ArrowLeft } from 'lucide-react';

interface NewPatientFormProps {
  onBack: () => void;
  onSave: (data: any) => void;
}

const NewPatientForm: React.FC<NewPatientFormProps> = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    firstName: '',
    lastName: '',
    age: '',
    city: '',
    appointmentDate: '',
    gender: '',
    description: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    apXray: File | null;
    latXray: File | null;
    apXrayUrl: string | null;
    latXrayUrl: string | null;
  }>({
    apXray: null,
    latXray: null,
    apXrayUrl: null,
    latXrayUrl: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving patient data:', formData);
    console.log('Uploaded files:', uploadedFiles);
    onSave({
      ...formData,
      apXrayImage: uploadedFiles.apXrayUrl,
      latXrayImage: uploadedFiles.latXrayUrl
    });
  };

  const handleDiscard = () => {
    setFormData({
      patientId: '',
      firstName: '',
      lastName: '',
      age: '',
      city: '',
      appointmentDate: '',
      gender: '',
      description: ''
    });
    setUploadedFiles({
      apXray: null,
      latXray: null,
      apXrayUrl: null,
      latXrayUrl: null
    });
    onBack();
  };

  // Device detection for iPad Pro
  const isIPadPro = () => {
    const userAgent = navigator.userAgent;
    const isIPad = /iPad/.test(userAgent);
    const isLargeScreen = window.screen.width >= 1024 && window.screen.height >= 1366;
    return isIPad && isLargeScreen;
  };

  const handleFileUpload = (type: 'camera' | 'file', xrayType: 'AP' | 'LAT') => {
    if (type === 'file') {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            setUploadedFiles(prev => ({
              ...prev,
              [xrayType === 'AP' ? 'apXray' : 'latXray']: file,
              [xrayType === 'AP' ? 'apXrayUrl' : 'latXrayUrl']: imageUrl
            }));
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else if (type === 'camera') {
      // For camera capture, we'll use the same file input but with capture attribute
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            setUploadedFiles(prev => ({
              ...prev,
              [xrayType === 'AP' ? 'apXray' : 'latXray']: file,
              [xrayType === 'AP' ? 'apXrayUrl' : 'latXrayUrl']: imageUrl
            }));
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const getFileDisplayName = (file: File | null) => {
    if (!file) return null;
    return file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name;
  };
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-4 mb-8">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h2 className="text-3xl font-semibold text-gray-800">New Patient Details</h2>
              </div>

              <div className="space-y-6">
                {/* Patient ID */}
                <div>
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    placeholder="Patient ID"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name*"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name*"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                {/* Age and City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Age"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Appointment Date and Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    placeholder="Appointment Date"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                    rows={4}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button
                    onClick={handleSave}
                    className="px-8 py-4 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-2xl border border-gray-300 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Upload Sections */}
          <div className="lg:col-span-1 space-y-6">
            {
              uploadedFiles.apXray ? 
              (
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden h-[280px]">
              
                  {uploadedFiles.apXray && (
                    <div className="">
                      {uploadedFiles.apXrayUrl && (
                        <div className="aspect-[4/3] overflow-hidden bg-black">
                          <img 
                            src={uploadedFiles.apXrayUrl} 
                            alt="AP X-Ray Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) 
              : 
              (
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl p-8 shadow-lg border border-gray-100 relative h-[280px]">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Upload AP Xray</h3>
                  
                  <div className={`flex items-center justify-center ${isIPadPro() ? 'justify-center' : 'space-x-8'}`}>
                    <button
                      onClick={() => handleFileUpload('camera', 'AP')}
                      className="flex flex-col items-center space-y-3 p-6 hover:bg-white/50 rounded-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                        <Camera size={28} className="text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 font-medium">Click</p>
                        <p className="text-gray-600 text-sm">Picture</p>
                      </div>
                    </button>

                    {!isIPadPro() && <div className="text-gray-500 font-medium text-lg">OR</div>}

                    {!isIPadPro() && (
                      <button
                        onClick={() => handleFileUpload('file', 'AP')}
                        className="flex flex-col items-center space-y-3 p-6 hover:bg-white/50 rounded-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                          <Upload size={28} className="text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-gray-700 font-medium">Upload</p>
                          <p className="text-gray-600 text-sm">from files</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )
            }

            {/* Upload LAT X-ray */}
            {
              uploadedFiles.latXray ? 
              (
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden h-[280px]">
              
                  {uploadedFiles.latXray && (
                    <div className="">
                      {uploadedFiles.latXrayUrl && (
                        <div className="aspect-[4/3] overflow-hidden bg-black">
                          <img 
                            src={uploadedFiles.latXrayUrl} 
                            alt="AP X-Ray Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) 
              : 
              (
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl p-8 shadow-lg border border-gray-100 relative">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Upload LAT Xray</h3>
                  <div className={`flex items-center justify-center ${isIPadPro() ? 'justify-center' : 'space-x-8'}`}>
                    <button
                      onClick={() => handleFileUpload('camera', 'LAT')}
                      className="flex flex-col items-center space-y-3 p-6 hover:bg-white/50 rounded-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                        <Camera size={28} className="text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 font-medium">Click</p>
                        <p className="text-gray-600 text-sm">Picture</p>
                      </div>
                    </button>

                    {!isIPadPro() && <div className="text-gray-500 font-medium text-lg">OR</div>}

                    {!isIPadPro() && (
                      <button
                        onClick={() => handleFileUpload('file', 'LAT')}
                        className="flex flex-col items-center space-y-3 p-6 hover:bg-white/50 rounded-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                          <Upload size={28} className="text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-gray-700 font-medium">Upload</p>
                          <p className="text-gray-600 text-sm">from files</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )
            }
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPatientForm;