import React, { useState, useRef, useCallback } from 'react';
import { Home, User, ArrowLeft, RotateCcw, Save } from 'lucide-react';

interface CalibrationAnnotationProps {
  onBack: () => void;
  onNext: () => void;
  patientData: {
    patientId: string;
    firstName: string;
    lastName: string;
    apXrayImage: string | null;
    latXrayImage: string | null;
  };
  onUpdateImages: (apImage: string | null, latImage: string | null, apRotation?: number, latRotation?: number) => void;
}

interface MarkerData {
  x: number;
  y: number;
  diameter: number;
  rotation: number;
  arrowRotation: number;
  isPositionSet: boolean;
}

const CalibrationAnnotation: React.FC<CalibrationAnnotationProps> = ({ onBack, onNext, patientData, onUpdateImages }) => {
  const [apMarker, setApMarker] = useState<MarkerData>({ 
    x: 50, 
    y: 50, 
    diameter: 25, 
    rotation: 0, 
    arrowRotation: 0,
    isPositionSet: false
  });
  const [latMarker, setLatMarker] = useState<MarkerData>({ 
    x: 50, 
    y: 50, 
    diameter: 25, 
    rotation: 0, 
    arrowRotation: 0,
    isPositionSet: false
  });
  const [apRotation, setApRotation] = useState(0);
  const [latRotation, setLatRotation] = useState(0);
  const [showRotationTooltip, setShowRotationTooltip] = useState({ ap: false, lat: false });
  const [currentStep, setCurrentStep] = useState<'initial' | 'detected' | 'adjusted' | 'straightened'>('initial');
  const [uploadedImages, setUploadedImages] = useState({
    apXray: patientData.apXrayImage,
    latXray: patientData.latXrayImage
  });
  const [isDraggingArrow, setIsDraggingArrow] = useState<'ap' | 'lat' | null>(null);

  // Add state to track actual displayed image dimensions
  const [apDisplayedImageSize, setApDisplayedImageSize] = useState({ width: 1, height: 1 });
  const [latDisplayedImageSize, setLatDisplayedImageSize] = useState({ width: 1, height: 1 });

  const apImageRef = useRef<HTMLDivElement>(null);
  const latImageRef = useRef<HTMLDivElement>(null);
  const apImgRef = useRef<HTMLImageElement>(null);
  const latImgRef = useRef<HTMLImageElement>(null);

  // Function to get actual displayed image dimensions
  const updateImageDimensions = () => {
    if (apImgRef.current) {
      const rect = apImgRef.current.getBoundingClientRect();
      setApDisplayedImageSize({ width: rect.width, height: rect.height });
    }
    if (latImgRef.current) {
      const rect = latImgRef.current.getBoundingClientRect();
      setLatDisplayedImageSize({ width: rect.width, height: rect.height });
    }
  };

  const handleAutoDetectMarker = () => {
    // Simulate auto-detection but keep position adjustable
    setApMarker({ 
      x: 45, 
      y: 60, 
      diameter: 25, 
      rotation: 37, 
      arrowRotation: -15,
      isPositionSet: false
    });
    setLatMarker({ 
      x: 55, 
      y: 65, 
      diameter: 25, 
      rotation: -4, 
      arrowRotation: 90,
      isPositionSet: false
    });
    setCurrentStep('detected');
    
    // Update image dimensions after detection
    setTimeout(updateImageDimensions, 200);
    
    // Show rotation tooltips
    setShowRotationTooltip({ ap: true, lat: true });
    setTimeout(() => {
      setShowRotationTooltip({ ap: false, lat: false });
    }, 3000);
  };

  const handleImageClick = useCallback((event: React.MouseEvent, imageType: 'ap' | 'lat') => {
    // Only prevent if dragging arrow
    if (isDraggingArrow) return;
    
    const currentMarker = imageType === 'ap' ? apMarker : latMarker;
    
    // Only allow position change if position is not set yet
    if (currentMarker.isPositionSet) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    if (imageType === 'ap') {
      setApMarker(prev => ({ ...prev, x, y, isPositionSet: true }));
    } else {
      setLatMarker(prev => ({ ...prev, x, y, isPositionSet: true }));
    }
  }, [isDraggingArrow, apMarker, latMarker]);

  const handleArrowDrag = useCallback((event: React.MouseEvent, imageType: 'ap' | 'lat') => {
    if (!isDraggingArrow || isDraggingArrow !== imageType) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = (imageType === 'ap' ? apMarker.x : latMarker.x) * rect.width / 100;
    const centerY = (imageType === 'ap' ? apMarker.y : latMarker.y) * rect.height / 100;
    
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
    
    if (imageType === 'ap') {
      setApMarker(prev => ({ ...prev, arrowRotation: angle }));
    } else {
      setLatMarker(prev => ({ ...prev, arrowRotation: angle }));
    }
  }, [isDraggingArrow, apMarker.x, apMarker.y, latMarker.x, latMarker.y]);

  const handleMouseDown = (imageType: 'ap' | 'lat') => {
    setIsDraggingArrow(imageType);
  };

  const handleMouseUp = () => {
    setIsDraggingArrow(null);
  };

  const handleSave = () => {
    setCurrentStep('straightened');
    // Calculate rotation needed to straighten based on arrow direction
    const apStraightenRotation = 90 - apMarker.arrowRotation; // Straighten to vertical
    const latStraightenRotation = 90 - latMarker.arrowRotation; // Straighten to vertical
    
    setApRotation(apStraightenRotation);
    setLatRotation(latStraightenRotation);
    
    // Pass the rotation values along with the images to the next component
    onUpdateImages(uploadedImages.apXray, uploadedImages.latXray, apStraightenRotation, latStraightenRotation);
  };

  const handleImageUpload = (type: 'ap' | 'lat') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          setUploadedImages(prev => ({
            ...prev,
            [type === 'ap' ? 'apXray' : 'latXray']: imageUrl
          }));
          
          // Reset marker position when new image is uploaded
          if (type === 'ap') {
            setApMarker(prev => ({ ...prev, isPositionSet: false }));
            onUpdateImages(imageUrl, uploadedImages.latXray);
          } else {
            setLatMarker(prev => ({ ...prev, isPositionSet: false }));
            onUpdateImages(uploadedImages.apXray, imageUrl);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Add reset function
  const handleResetMarkers = () => {
    setApMarker(prev => ({ ...prev, isPositionSet: false }));
    setLatMarker(prev => ({ ...prev, isPositionSet: false }));
    setCurrentStep('initial');
  };

  const renderMarker = (marker: MarkerData, imageType: 'ap' | 'lat') => (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
    >
      {/* Crosshair */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute w-0.5 h-16 bg-yellow-400 -translate-x-1/2 -translate-y-8"></div>
        {/* Horizontal line */}
        <div className="absolute h-0.5 w-16 bg-yellow-400 -translate-y-1/2 -translate-x-8"></div>
        {/* Center circle */}
        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* Arrow Direction Indicator */}
      {currentStep !== 'initial' && (
        <div 
        className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{ 
          transform: `rotate(${marker.arrowRotation}deg)`,
          transformOrigin: 'center'
        }}
        onMouseDown={() => handleMouseDown(imageType)}
        >
        {/* Arrow shaft */}
        <div className="absolute w-12 h-1 bg-yellow-400 -translate-y-1/2"></div>
        {/* Arrow head */}
        <div 
          className="absolute right-0 top-1/2 transform -translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid #fbbf24',
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent'
          }}
        ></div>
        </div>
      )}
      
      {/* Rotation tooltip */}
      {showRotationTooltip[imageType] && (
        <div className="absolute top-8 left-8 bg-white px-3 py-1 rounded-lg shadow-lg text-sm font-medium text-gray-800 whitespace-nowrap pointer-events-none">
          Rotated to {marker.rotation > 0 ? '+' : ''}{marker.rotation} degrees
        </div>
      )}
    </div>
  );

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
          <h2 className="text-3xl font-semibold text-gray-800">Calibration Annotation</h2>
          <div className="flex space-x-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-2xl border border-gray-300 transition-all duration-300"
            >
              Back
            </button>
            {currentStep === 'straightened' ? (
              <button
                onClick={onNext}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all duration-300"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all duration-300"
              >
                Save
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[750px]">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
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

              {/* X-Ray Imaging Parameters */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">X-Ray Imaging Parameters</h3>
                
                {/* AP X-Ray */}
                <div className="space-y-3">
                  <button 
                    className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors duration-200"
                    onClick={() => handleImageUpload('ap')}
                  >
                    {uploadedImages.apXray ? 'Change AP X-Ray' : 'Upload AP X-Ray'}
                  </button>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm">AP Market Diameter(mm):</span>
                    <span className="px-3 py-1 bg-white text-gray-800 rounded-lg font-medium">25</span>
                  </div>
                </div>

                {/* LAT X-Ray */}
                <div className="space-y-3">
                  <button 
                    className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors duration-200"
                    onClick={() => handleImageUpload('lat')}
                  >
                    {uploadedImages.latXray ? 'Change LAT X-Ray' : 'Upload LAT X-Ray'}
                  </button>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm">LAT Market Diameter(mm):</span>
                    <span className="px-3 py-1 bg-white text-gray-800 rounded-lg font-medium">25</span>
                  </div>
                </div>

                {/* Auto Detect Button */}
                <button
                  onClick={handleAutoDetectMarker}
                  className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Auto Detect Marker</span>
                </button>

                {/* Reset Markers Button */}
                {currentStep === 'straightened' && (
                  <button
                    onClick={handleResetMarkers}
                    className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <RotateCcw size={16} />
                    <span>Reset Markers</span>
                  </button>
                )}

                {/* Help Text */}
                <div className="bg-white/10 rounded-xl p-4 text-xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <span className="text-xs">?</span>
                    </div>
                  </div>
                  <p>Position the red-cross at a common location around the fracture on both the X-rays and the red-arrow head along the bone shaft direction.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns - X-Ray Images */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AP X-Ray - FIXED CONTAINER */}
            <div className="bg-black rounded-3xl overflow-hidden shadow-lg relative">
              <div className="w-full h-[700px] relative">
                {/* Fixed Image Container - No transforms applied to this container */}
                <div
                  ref={apImageRef}
                  className={`w-full h-full relative ${
                    !apMarker.isPositionSet && currentStep !== 'initial' ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  onClick={(e) => handleImageClick(e, 'ap')}
                  onMouseMove={(e) => handleArrowDrag(e, 'ap')}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Background Image - Fixed positioning */}
                  {uploadedImages.apXray && (
                    <img
                      ref={apImgRef}
                      src={uploadedImages.apXray}
                      alt="AP X-Ray"
                      className="w-full h-full object-contain"
                      style={{
                        transform: currentStep === 'straightened' ? `rotate(${apRotation}deg)` : 'rotate(0deg)',
                        transition: 'transform 0.5s ease-in-out',
                        transformOrigin: 'center center'
                      }}
                      onLoad={updateImageDimensions}
                      draggable={false}
                    />
                  )}
                  
                  {/* Markers overlay - positioned absolutely over the fixed container */}
                  {currentStep !== 'initial' && renderMarker(apMarker, 'ap')}
                </div>
              </div>
            </div>

            {/* LAT X-Ray - FIXED CONTAINER */}
            <div className="bg-black rounded-3xl overflow-hidden shadow-lg relative">
              <div className="w-full h-[700px] relative">
                {/* Fixed Image Container - No transforms applied to this container */}
                <div
                  ref={latImageRef}
                  className={`w-full h-full relative ${
                    !latMarker.isPositionSet && currentStep !== 'initial' ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  onClick={(e) => handleImageClick(e, 'lat')}
                  onMouseMove={(e) => handleArrowDrag(e, 'lat')}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Background Image - Fixed positioning */}
                  {uploadedImages.latXray && (
                    <img
                      ref={latImgRef}
                      src={uploadedImages.latXray}
                      alt="LAT X-Ray"
                      className="w-full h-full object-contain"
                      style={{
                        transform: currentStep === 'straightened' ? `rotate(${latRotation}deg)` : 'rotate(0deg)',
                        transition: 'transform 0.5s ease-in-out',
                        transformOrigin: 'center center'
                      }}
                      onLoad={updateImageDimensions}
                      draggable={false}
                    />
                  )}
                  
                  {/* Markers overlay - positioned absolutely over the fixed container */}
                  {currentStep !== 'initial' && renderMarker(latMarker, 'lat')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationAnnotation;