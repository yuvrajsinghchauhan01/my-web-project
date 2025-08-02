import React, { useState, useEffect } from 'react';
import { Home, User, X, Info } from 'lucide-react';

interface PatientData {
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
}

interface ImplantTemplatingProps {
  onBack: () => void;
  onSave: () => void;
  patientData: PatientData;
}

const ImplantTemplating: React.FC<ImplantTemplatingProps> = ({ 
  onBack, 
  onSave, 
  patientData 
}) => {
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

  // Point marking state
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [measurementLength, setMeasurementLength] = useState<number | null>(null);
  const [modelInfo, setModelInfo] = useState<string>('');

  // Popup and suggested plates state
  const [showSuggestPopup, setShowSuggestPopup] = useState(false);
  const [suggestedPlates, setSuggestedPlates] = useState<any>(null);

  // Session management
  const [processedApImage, setProcessedApImage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const handleBonePlateChange = (bone: string, value: string) => {
    setSelectedBonePlates(prev => ({
      ...prev,
      [bone]: value
    }));
  };

  const boneOptions = ['none', 'Plate A', 'Plate B', 'Plate C', 'Plate D', 'Plate E'];

  // Check if any bone plate is selected
  const hasSelectedBonePlate = Object.values(selectedBonePlates).some(value => value !== 'none');

  // Handle Auto button click
  const handleAutoClick = () => {
    if (isAutoMode) {
      // Clear points and exit auto mode
      setPoints([]);
      setMeasurementLength(null);
      setModelInfo('');
      setSuggestedPlates(null);
      setIsAutoMode(false);
    } else {
      // Enter auto mode
      setIsAutoMode(true);
      setPoints([]);
      setMeasurementLength(null);
      setModelInfo('');
      setSuggestedPlates(null);
    }
  };

  // Handle point marking on AP X-ray
  const handleAPXrayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isAutoMode) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (points.length < 2) {
      const newPoints = [...points, { x, y }];
      setPoints(newPoints);

      if (newPoints.length === 2) {
        // Send points to backend for full processing
        sendMeasurementToBackend(newPoints);
      }
    }
  };

  // Extract measurement from suggest-plates response
  const extractMeasurementFromResponse = (suggestData: any): number | null => {
    try {
      // Check if it's the Django response format
      if (suggestData.status && suggestData.suggestions) {
        // Check if measurement is at root level
        if (suggestData.measurement !== undefined) {
          const value = parseFloat(suggestData.measurement);
          return value;
        }
        
        // Check suggestions array for measurement
        if (Array.isArray(suggestData.suggestions) && suggestData.suggestions.length > 0) {
          const firstSuggestion = suggestData.suggestions[0];
          
          if (firstSuggestion.measurement !== undefined) {
            const value = parseFloat(firstSuggestion.measurement);
            return value;
          }
        }
      }
      
      // Try ALL possible field names for measurement
      const possibleFields = [
        'measured_length', 'measurement', 'length', 'distance', 
        'measured_distance', 'pixel_distance', 'real_distance',
        'scale_length', 'calibrated_length', 'mm_length', 'measured_mm'
      ];
      
      for (const field of possibleFields) {
        if (suggestData[field] !== undefined && suggestData[field] !== null) {
          const value = parseFloat(suggestData[field]);
          if (!isNaN(value) && value > 0) {
            return value;
          }
        }
      }

      return null;

    } catch (error) {
      return null;
    }
  };

  // Convert image URL to Blob for file upload
  const urlToFile = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error converting URL to file:', error);
      throw error;
    }
  };

  // Load image into session
  const loadImageIntoSession = async (sessionId: string, imageUrl: string) => {
    try {
      const imageFile = await urlToFile(imageUrl, 'xray_image.png');
      
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(
        `http://localhost:8000/api/sessions/${sessionId}/load-image/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load image");
      }

      return await response.json();
    } catch (error) {
      console.error("Error loading image:", error);
      throw error;
    }
  };

  // Initialize session and load image
  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        setIsLoadingSession(true);
        setSessionError(null);

        // Create session
        const sessionResponse = await fetch("http://localhost:8000/api/sessions/", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });

        if (!sessionResponse.ok) throw new Error("Session creation failed");
        
        const { session_id } = await sessionResponse.json();
        if (!isMounted) return;

        setSessionId(session_id);

        // Load image if available
        if (patientData.apXrayImage) {
          await loadImageIntoSession(session_id, patientData.apXrayImage);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        if (isMounted) setSessionError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        if (isMounted) setIsLoadingSession(false);
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
      if (sessionId) {
        fetch(`http://localhost:8000/api/sessions/${sessionId}/`, {
          method: "DELETE"
        }).catch(console.warn);
      }
    };
  }, [patientData.apXrayImage]);

  const sendMeasurementToBackend = async (points: { x: number; y: number }[]) => {
    if (!sessionId) {
      return;
    }

    try {
      // Step 1: Clear measurements first
      await fetch(`http://localhost:8000/api/sessions/${sessionId}/clear-points/`, {
        method: 'POST',
      });

      // Step 2: Add new points
      for (const point of points) {
        await fetch(`http://localhost:8000/api/sessions/${sessionId}/add-point/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(point),
        });
      }

      // Step 3: Suggest plates and get measurement
      const suggestRes = await fetch(`http://localhost:8000/api/sessions/${sessionId}/suggest-plates/`, {
        method: 'POST',
      });

      if (!suggestRes.ok) return;

      // Get suggest plates response with measurement
      const suggestData = await suggestRes.json();
      
      // Extract measurement from the suggest-plates response
      const measurement = extractMeasurementFromResponse(suggestData);
      if (measurement) {
        setMeasurementLength(measurement);
      } else {
        // Fallback: Try to get measurement from session status
        const statusRes = await fetch(`http://localhost:8000/api/sessions/${sessionId}/status/`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          const fallbackMeasurement = extractMeasurementFromResponse(statusData);
          if (fallbackMeasurement) {
            setMeasurementLength(fallbackMeasurement);
          }
        }
      }
      
      // Store the complete response
      setSuggestedPlates(suggestData);

      // Step 4: Place model
      await fetch(`http://localhost:8000/api/sessions/${sessionId}/place-model/`, {
        method: 'POST',
      });

      // Step 5: Get visualization
      const imageResponse = await fetch(`http://localhost:8000/api/sessions/${sessionId}/visualization/`);
      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);
        setProcessedApImage(imageObjectURL);
        setModelInfo('Model Placed');
      }

    } catch (error) {
      console.error('Error during backend operations:', error);
    }
  };

  // Handle closing the popup
  const handleClosePopup = () => {
    setShowSuggestPopup(false);
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
            <h1 className="text-2xl font-semibold text-gray-800 tracking-wide">MERIL - ATS</h1>
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
          {/* Left Column */}
          <div className="lg:col-span-1 overflow-y-auto h-full rounded-3xl">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 shadow-xl text-white">
              {/* Case Details */}
              <div className="bg-white text-gray-800 rounded-xl p-4 mb-6">
                <h3 className="text-base font-semibold mb-2">Case Details</h3>
                <p className="text-sm">
                  Patient ID: <span className="font-medium">{patientData.patientId}</span>
                </p>
                <p className="text-sm">
                  Name:{' '}
                  <span className="font-medium">
                    {patientData.firstName} {patientData.lastName}
                  </span>
                </p>
                <button className="mt-3 px-3 py-1 text-sm bg-[#3B4CCA] text-white rounded-lg hover:bg-[#2e3aa3]">
                  Edit / Add Details
                </button>
              </div>

              {/* Bone Plate */}
              <button className="w-full py-2 bg-white text-[#3B4CCA] font-semibold rounded-xl mb-4">
                Select Bone Plate
              </button>

              {/* Bone Selection */}
              <div className="space-y-4 mb-6">
                {Object.entries(selectedBonePlates).map(([bone, value]) => (
                  <div key={bone} className="flex items-center justify-between">
                    <label className="text-sm capitalize flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value !== 'none'}
                        onChange={e =>
                          handleBonePlateChange(
                            bone,
                            e.target.checked
                              ? bone === 'tibia'
                                ? '3.5mm LPS Proximal Tibia'
                                : 'Plate A'
                              : 'none'
                          )
                        }
                        className="form-checkbox h-4 w-4 text-white bg-transparent border-white"
                      />
                      {bone}
                    </label>
                    <select
                      value={value}
                      onChange={e => handleBonePlateChange(bone, e.target.value)}
                      disabled={value === 'none'}
                      className="px-2 py-1 bg-white/20 border border-white/30 rounded-lg text-white text-sm focus:outline-none"
                    >
                      {bone === 'tibia' ? (
                        <>
                          <option value="none" className="bg-[#3B4CCA] text-white">
                            none
                          </option>
                          <option
                            value="3.5mm LPS Proximal Tibia"
                            className="bg-[#3B4CCA] text-white"
                          >
                            3.5mm LPS Proximal Tibia
                          </option>
                        </>
                      ) : (
                        boneOptions.map(option => (
                          <option key={option} value={option} className="bg-[#3B4CCA] text-white">
                            {option}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                ))}
              </div>

              {/* Adjust and Auto Buttons */}
              <div className="space-y-3">
                <div className="flex justify-between gap-2">
                  <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex-1">
                    Adjust
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg text-sm flex-1 transition-all duration-300 ${
                      hasSelectedBonePlate 
                        ? isAutoMode 
                          ? 'bg-green-500/30 hover:bg-green-500/40 cursor-pointer' 
                          : 'bg-white/20 hover:bg-white/30 cursor-pointer'
                        : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                    disabled={!hasSelectedBonePlate}
                    onClick={handleAutoClick}
                  >
                    {isAutoMode ? 'Auto (Active)' : 'Auto'}
                  </button>
                </div>

                {/* Suggest Model Button */}
                <div className="mt-3">
                  <button 
                    className={`w-full px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                      suggestedPlates 
                        ? 'bg-black hover:bg-gray-800 cursor-pointer' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!suggestedPlates}
                    onClick={() => {
                      if (suggestedPlates) {
                        setShowSuggestPopup(true);
                      }
                    }}
                  >
                    Suggest Model
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* AP X-Ray */}
            <div className="bg-black rounded-3xl overflow-hidden shadow-lg relative">
              <div
                className={`aspect-[3/4] bg-black relative ${isAutoMode ? 'cursor-crosshair' : ''}`}
                style={{
                  backgroundImage: processedApImage 
                    ? `url("${processedApImage}")` 
                    : patientData.apXrayImage 
                      ? `url("${patientData.apXrayImage}")` 
                      : 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  transform: `rotate(${patientData.apRotation || 0}deg)`,
                }}
                onClick={handleAPXrayClick}
              >
                {/* Model Information */}
                {processedApImage && modelInfo && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-medium">
                    Model: {modelInfo}
                  </div>
                )}

                {/* Points - Only show if no processed image */}
                {!processedApImage && points.map((point, index) => (
                  <div
                    key={index}
                    className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white transform -translate-x-2 -translate-y-2"
                    style={{ left: point.x, top: point.y }}
                  >
                    <span className="absolute -top-6 -left-2 text-red-500 font-bold text-sm">
                      P{index + 1}
                    </span>
                  </div>
                ))}

                {/* Line between points */}
                {!processedApImage && points.length === 2 && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 10 }}
                  >
                    <line
                      x1={points[0].x}
                      y1={points[0].y}
                      x2={points[1].x}
                      y2={points[1].y}
                      stroke="#3B82F6"
                      strokeWidth="3"
                    />
                  </svg>
                )}

                {/* Length measurement */}
                {measurementLength && (
                  <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                    {measurementLength.toFixed(1)}mm
                  </div>
                )}

                {/* Reference scale */}
                <div className="absolute top-4 right-20 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  Ref: 25.0mm
                </div>
              </div>
            </div>

            {/* Lateral X-Ray */}
            <div className="bg-black rounded-3xl overflow-hidden shadow-lg relative">
              <div
                className="aspect-[3/4] bg-black relative"
                style={{
                  backgroundImage: patientData.latXrayImage
                    ? `url("${patientData.latXrayImage}")`
                    : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  transform: `rotate(${patientData.latRotation || 0}deg)`,
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Suggest Model Popup */}
      {showSuggestPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Suggested Plate Information</h2>
              <button
                onClick={handleClosePopup}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {suggestedPlates ? (
                <div className="space-y-6">
                  {/* Measurement Display */}
                  {measurementLength && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                      <h3 className="text-xl font-bold text-blue-800 mb-2">
                        📏 Measurement: {measurementLength.toFixed(1)}mm
                      </h3>
                      <div className="text-sm text-blue-600">
                        Extracted from backend suggest-plates response
                      </div>
                    </div>
                  )}

                  {/* Suggested Plates */}
                  {suggestedPlates.suggestions && suggestedPlates.suggestions.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border">
                      <div className="bg-gray-50 px-6 py-4 border-b">
                        <h3 className="text-lg font-bold text-gray-800">
                          🔧 Found {suggestedPlates.suggestions.length} Plate Suggestions:
                        </h3>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        {suggestedPlates.suggestions.map((plate: any, index: number) => {
                          const measuredLength = measurementLength || 0;
                          const plateWidth = parseFloat(plate.width_mm || plate.width || 0);
                          const difference = Math.abs(plateWidth - measuredLength);
                          const matchPercentage = Math.max(0, 100 - (difference * 2));
                          
                          return (
                            <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all">
                              {/* Plate Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                                    {index + 1}. {plate.name || `Plate ${index + 1}`}
                                  </h4>
                                </div>
                                
                                {/* Match Percentage Badge */}
                                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                                  matchPercentage >= 95 ? 'bg-green-100 text-green-800' :
                                  matchPercentage >= 85 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {matchPercentage.toFixed(1)}% Match
                                </div>
                              </div>

                              {/* Plate Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Measured Length */}
                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                  <div className="text-xs text-blue-600 uppercase tracking-wide font-semibold mb-1">Measured</div>
                                  <div className="text-lg font-bold text-blue-800">{measuredLength.toFixed(1)}mm</div>
                                </div>

                                {/* Plate Width */}
                                {plateWidth > 0 && (
                                  <div className="bg-white rounded-lg p-3 border">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Plate Width</div>
                                    <div className="text-lg font-bold text-gray-800">{plateWidth.toFixed(1)}mm</div>
                                  </div>
                                )}

                                {/* Holes */}
                                {plate.holes !== undefined && (
                                  <div className="bg-white rounded-lg p-3 border">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Holes</div>
                                    <div className="text-lg font-bold text-gray-800">{plate.holes}</div>
                                  </div>
                                )}
                              </div>

                              {/* Additional Properties */}
                              {Object.keys(plate).filter(key => !['name', 'width', 'width_mm', 'holes'].includes(key)).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                    {Object.entries(plate)
                                      .filter(([key]) => !['name', 'width', 'width_mm', 'holes'].includes(key))
                                      .map(([key, value]: [string, any]) => (
                                        <div key={key} className="bg-gray-100 px-2 py-1 rounded">
                                          <span className="font-medium text-gray-700">{key}:</span>{' '}
                                          <span className="text-gray-600">{String(value)}</span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <div className="text-yellow-600 mb-2">⚠️</div>
                      <p className="text-yellow-800 font-medium">No plate suggestions found in the response.</p>
                    </div>
                  )}


                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <Info size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">No suggested plates information available.</p>
                  <p className="text-sm">Please use the Auto button first to generate suggestions.</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
              <div className="text-sm text-gray-600">
                {suggestedPlates?.suggestions ? 
                  `${suggestedPlates.suggestions.length} plate suggestion(s) found` : 
                  'No backend response available'
                }
              </div>
              <button
                onClick={handleClosePopup}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImplantTemplating;