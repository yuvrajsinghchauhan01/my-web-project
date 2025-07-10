import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Home, User, ArrowLeft, ArrowUp, ArrowDown, ArrowRight, RotateCcw, RotateCw, X } from 'lucide-react';

interface BoneAnnotationProps {
  onBack: () => void;
  onSave: (data: any) => void;
  onNext: (data: any) => void;
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

interface Point {
  x: number;
  y: number;
}

interface PolygonData {
  points: Point[];
  isComplete: boolean;
}

interface AdjustmentState {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

const BoneAnnotation: React.FC<BoneAnnotationProps> = ({ onBack, onSave, onNext, patientData }) => {
  const [currentMode, setCurrentMode] = useState<'initial' | 'drawAP' | 'drawML' | 'adjust'>('initial');
  const [apPolygon, setApPolygon] = useState<PolygonData>({ points: [], isComplete: false });
  const [mlPolygon, setMlPolygon] = useState<PolygonData>({ points: [], isComplete: false });
  const [apSaved, setApSaved] = useState(false);
  const [mlSaved, setMlSaved] = useState(false);
  const [adjustmentMode, setAdjustmentMode] = useState<'ap' | 'ml' | null>(null);
  const [apAdjustment, setApAdjustment] = useState<AdjustmentState>({ 
    x: 0, y: 0, rotation: 0, scale: 1, cropX: 0, cropY: 0, cropWidth: 100, cropHeight: 100 
  });
  const [mlAdjustment, setMlAdjustment] = useState<AdjustmentState>({ 
    x: 0, y: 0, rotation: 0, scale: 1, cropX: 0, cropY: 0, cropWidth: 100, cropHeight: 100 
  });
  const [adjustmentValue, setAdjustmentValue] = useState(2);
  const [rotationValue, setRotationValue] = useState(5);
  const [scaleValue, setScaleValue] = useState(0.1);
  const [adjustmentType, setAdjustmentType] = useState<'transition' | 'rotation' | 'scale' | 'crop'>('transition');
  const [apAdjustmentSaved, setApAdjustmentSaved] = useState(false);
  const [mlAdjustmentSaved, setMlAdjustmentSaved] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'none' | 'ap' | 'ml'>('none');
  const [cropMode, setCropMode] = useState<'none' | 'ap' | 'ml'>('none');
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [segmentAdded, setSegmentAdded] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [currentApRotation, setCurrentApRotation] = useState(0);
  const [currentLatRotation, setCurrentLatRotation] = useState(0);

  const apImageRef = useRef<HTMLDivElement>(null);
  const mlImageRef = useRef<HTMLDivElement>(null);

  // Initialize rotation values from patient data
  useEffect(() => {
    setCurrentApRotation(patientData.apRotation || 0);
    setCurrentLatRotation(patientData.latRotation || 0);
  }, [patientData.apRotation, patientData.latRotation]);

  // Calculate center point for rotation
  const calculateCenter = (points: Point[]): Point => {
    if (points.length === 0) return { x: 50, y: 50 };
    
    const sum = points.reduce((acc, point) => {
      return { x: acc.x + point.x, y: acc.y + point.y };
    }, { x: 0, y: 0 });
    
    return {
      x: sum.x / points.length,
      y: sum.y / points.length
    };
  };

  const apCenter = calculateCenter(apPolygon.points);
  const mlCenter = calculateCenter(mlPolygon.points);

  const handleAddBoneSegment = () => {
    setSegmentAdded(true);
    setCurrentMode('initial');
    setDrawingMode('none');
  };

  const handleResetSegment = () => {
    setSegmentAdded(false);
    setCurrentMode('initial');
    setDrawingMode('none');
    setApPolygon({ points: [], isComplete: false });
    setMlPolygon({ points: [], isComplete: false });
    setApSaved(false);
    setMlSaved(false);
    setApAdjustmentSaved(false);
    setMlAdjustmentSaved(false);
    setHoverPoint(null);
  };

  const handleDrawAP = () => {
    setDrawingMode('ap');
    setApPolygon({ points: [], isComplete: false });
    setApSaved(false);
    setHoverPoint(null);
  };

  const handleDrawML = () => {
    setDrawingMode('ml');
    setMlPolygon({ points: [], isComplete: false });
    setMlSaved(false);
    setHoverPoint(null);
  };

  const handleEditAP = () => {
    setDrawingMode('ap');
    setApPolygon(prev => ({ ...prev, isComplete: false }));
    setApSaved(false);
    setHoverPoint(null);
  };

  const handleEditML = () => {
    setDrawingMode('ml');
    setMlPolygon(prev => ({ ...prev, isComplete: false }));
    setMlSaved(false);
    setHoverPoint(null);
  };

  const handleImageClick = useCallback((event: React.MouseEvent, imageType: 'ap' | 'ml') => {
    if (drawingMode === 'none') return;
    if ((drawingMode === 'ap' && imageType !== 'ap') || (drawingMode === 'ml' && imageType !== 'ml')) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Check if clicking near the first point to close the polygon
    if (hoverPoint && imageType === drawingMode) {
      if (imageType === 'ap') {
        setApPolygon(prev => ({ ...prev, isComplete: true }));
        setApSaved(true);
      } else {
        setMlPolygon(prev => ({ ...prev, isComplete: true }));
        setMlSaved(true);
      }
      setDrawingMode('none');
      setHoverPoint(null);
      return;
    }

    const newPoint = { x, y };
    
    if (drawingMode === 'ap') {
      setApPolygon(prev => ({
        ...prev,
        points: [...prev.points, newPoint]
      }));
    } else if (drawingMode === 'ml') {
      setMlPolygon(prev => ({
        ...prev,
        points: [...prev.points, newPoint]
      }));
    }
  }, [drawingMode, hoverPoint]);

  const handleMouseMove = useCallback((event: React.MouseEvent, imageType: 'ap' | 'ml') => {
    if (drawingMode === 'none') return;
    if ((drawingMode === 'ap' && imageType !== 'ap') || (drawingMode === 'ml' && imageType !== 'ml')) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Check if close to first point
    const currentPolygon = imageType === 'ap' ? apPolygon : mlPolygon;
    if (currentPolygon.points.length > 2) {
      const firstPoint = currentPolygon.points[0];
      const distance = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2));
      if (distance < 3) { // 3% threshold
        setHoverPoint(firstPoint);
        return;
      }
    }
    setHoverPoint(null);
  }, [drawingMode, apPolygon, mlPolygon]);

  const handleSaveAP = () => {
    if (apPolygon.points.length >= 3) {
      setApPolygon(prev => ({ ...prev, isComplete: true }));
      setApSaved(true);
      setDrawingMode('none');
    }
  };

  const handleSaveML = () => {
    if (mlPolygon.points.length >= 3) {
      setMlPolygon(prev => ({ ...prev, isComplete: true }));
      setMlSaved(true);
      setDrawingMode('none');
    }
  };

  const handleDiscardPolygon = () => {
    if (drawingMode === 'ap') {
      setApPolygon({ points: [], isComplete: false });
      setDrawingMode('none');
    } else if (drawingMode === 'ml') {
      setMlPolygon({ points: [], isComplete: false });
      setDrawingMode('none');
    } else {
      handleResetSegment();
    }
    setHoverPoint(null);
  };

  const handleAdjustment = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!adjustmentMode) return;

    const value = adjustmentValue;
    const adjustment = adjustmentMode === 'ap' ? apAdjustment : mlAdjustment;
    const setAdjustment = adjustmentMode === 'ap' ? setApAdjustment : setMlAdjustment;

    switch (direction) {
      case 'up':
        setAdjustment({ ...adjustment, y: adjustment.y - value });
        break;
      case 'down':
        setAdjustment({ ...adjustment, y: adjustment.y + value });
        break;
      case 'left':
        setAdjustment({ ...adjustment, x: adjustment.x - value });
        break;
      case 'right':
        setAdjustment({ ...adjustment, x: adjustment.x + value });
        break;
    }
  };

  const handleRotation = (degrees: number) => {
    if (!adjustmentMode) return;

    const adjustment = adjustmentMode === 'ap' ? apAdjustment : mlAdjustment;
    const setAdjustment = adjustmentMode === 'ap' ? setApAdjustment : setMlAdjustment;

    setAdjustment(prev => ({ ...prev, rotation: prev.rotation + degrees }));
  };

  const handleScale = (direction: 'up' | 'down') => {
    if (!adjustmentMode) return;

    const value = scaleValue;
    const adjustment = adjustmentMode === 'ap' ? apAdjustment : mlAdjustment;
    const setAdjustment = adjustmentMode === 'ap' ? setApAdjustment : setMlAdjustment;

    if (direction === 'up') {
      setAdjustment({ ...adjustment, scale: Math.min(adjustment.scale + value, 3) });
    } else {
      setAdjustment({ ...adjustment, scale: Math.max(adjustment.scale - value, 0.1) });
    }
  };

  const handleCropStart = (imageType: 'ap' | 'ml') => {
    setCropMode(imageType);
    setCropStart(null);
    setCropEnd(null);
  };

  const handleCropImageClick = useCallback((event: React.MouseEvent, imageType: 'ap' | 'ml') => {
    if (cropMode !== imageType) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    if (!cropStart) {
      setCropStart({ x, y });
    } else {
      setCropEnd({ x, y });
      
      // Calculate crop area
      const cropX = Math.min(cropStart.x, x);
      const cropY = Math.min(cropStart.y, y);
      const cropWidth = Math.abs(x - cropStart.x);
      const cropHeight = Math.abs(y - cropStart.y);

      const adjustment = imageType === 'ap' ? apAdjustment : mlAdjustment;
      const setAdjustment = imageType === 'ap' ? setApAdjustment : setMlAdjustment;

      setAdjustment({ 
        ...adjustment, 
        cropX, 
        cropY, 
        cropWidth, 
        cropHeight 
      });

      setCropMode('none');
      setCropStart(null);
      setCropEnd(null);
    }
  }, [cropMode, cropStart, apAdjustment, mlAdjustment]);

  const handleSaveAdjustment = () => {
    if (adjustmentMode === 'ap') {
      setApAdjustmentSaved(true);
    } else if (adjustmentMode === 'ml') {
      setMlAdjustmentSaved(true);
    }
    setAdjustmentMode(null);
    setCurrentMode('initial');
    setAdjustmentType('transition');
    setCropMode('none');
  };

  const handleCancelAdjustment = () => {
    if (adjustmentMode === 'ap') {
      setApAdjustment({ x: 0, y: 0, rotation: 0, scale: 1, cropX: 0, cropY: 0, cropWidth: 100, cropHeight: 100 });
    } else if (adjustmentMode === 'ml') {
      setMlAdjustment({ x: 0, y: 0, rotation: 0, scale: 1, cropX: 0, cropY: 0, cropWidth: 100, cropHeight: 100 });
    }
    setAdjustmentMode(null);
    setCurrentMode('initial');
    setAdjustmentType('transition');
    setCropMode('none');
  };

  const handleFinalSave = () => {
    const boneAnnotationData = {
      apPolygon,
      latPolygon: mlPolygon,
      apAdjustment,
      latAdjustment: mlAdjustment
    };
    
    if (apAdjustmentSaved && mlAdjustmentSaved) {
      onNext(boneAnnotationData);
    } else {
      onSave(boneAnnotationData);
    }
  };

  const renderPolygon = (polygon: PolygonData, adjustment: AdjustmentState, center: Point, imageType: 'ap' | 'ml') => {
    if (polygon.points.length === 0) return null;

    return (
      <>
        {/* Semi-transparent mask for original area */}
        {polygon.isComplete && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polygon 
              points={polygon.points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="rgba(0,0,0,0.7)" 
            />
          </svg>
        )}

        {/* Cropped segment with transformations */}
        {polygon.isComplete && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: `polygon(${polygon.points.map(p => `${p.x}% ${p.y}%`).join(', ')})`,
              backgroundImage: imageType === 'ap' 
                ? `url("${patientData.apXrayImage}")`
                : `url("${patientData.latXrayImage}")`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              transform: `
                translate(${adjustment.x}px, ${adjustment.y}px)
                rotate(${adjustment.rotation}deg)
                scale(${adjustment.scale})
              `,
              transformOrigin: `${center.x}% ${center.y}%`,
              transition: 'transform 0.2s ease',
              zIndex: 10
            }}
          />
        )}

        {/* Drawing UI */}
        {!polygon.isComplete && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Lines between points */}
            {polygon.points.length > 1 && polygon.points.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = polygon.points[index - 1];
              return (
                <line
                  key={`line-${index}`}
                  x1={`${prevPoint.x}%`}
                  y1={`${prevPoint.y}%`}
                  x2={`${point.x}%`}
                  y2={`${point.y}%`}
                  stroke="#ffff00"
                  strokeWidth="2"
                />
              );
            })}

            {/* Closing line when hovered */}
            {hoverPoint && polygon.points.length > 2 && (
              <line
                x1={`${polygon.points[polygon.points.length - 1].x}%`}
                y1={`${polygon.points[polygon.points.length - 1].y}%`}
                x2={`${hoverPoint.x}%`}
                y2={`${hoverPoint.y}%`}
                stroke="#ffff00"
                strokeWidth="2"
              />
            )}

            {/* Points */}
            {polygon.points.map((point, index) => (
              <circle
                key={index}
                cx={`${point.x}%`}
                cy={`${point.y}%`}
                r="4"
                fill="#ffff00"
                stroke="#000"
                strokeWidth="1"
              />
            ))}
          </svg>
        )}
      </>
    );
  };

  const renderCropOverlay = (imageType: 'ap' | 'ml') => {
    if (cropMode !== imageType) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Crop selection area */}
        {cropStart && cropEnd && (
          <div
            className="absolute border-2 border-yellow-400 bg-yellow-400/20"
            style={{
              left: `${Math.min(cropStart.x, cropEnd.x)}%`,
              top: `${Math.min(cropStart.y, cropEnd.y)}%`,
              width: `${Math.abs(cropEnd.x - cropStart.x)}%`,
              height: `${Math.abs(cropEnd.y - cropStart.y)}%`,
            }}
          />
        )}
        
        {/* Crop start point */}
        {cropStart && !cropEnd && (
          <div
            className="absolute w-2 h-2 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${cropStart.x}%`,
              top: `${cropStart.y}%`,
            }}
          />
        )}
      </div>
    );
  };

  const renderAdjustmentControls = () => {
    if (!adjustmentMode) return null;

    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-lg p-4 z-10">
        <div className="flex flex-col items-center space-y-2">
          {/* Adjustment Type Toggle */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setAdjustmentType('transition')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                adjustmentType === 'transition' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Transition
            </button>
            <button
              onClick={() => setAdjustmentType('rotation')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                adjustmentType === 'rotation' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Rotation
            </button>
            <button
              onClick={() => setAdjustmentType('scale')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                adjustmentType === 'scale' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Scale
            </button>
            <button
              onClick={() => setAdjustmentType('crop')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                adjustmentType === 'crop' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Crop
            </button>
          </div>

          {adjustmentType === 'transition' ? (
            <>
              {/* Transition Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleAdjustment('up')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <ArrowUp size={16} className="text-white" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleAdjustment('left')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <ArrowLeft size={16} className="text-white" />
                </button>
                <input
                  type="number"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                  className="w-12 px-2 py-1 bg-white text-black rounded text-center text-sm"
                  min="1"
                  max="10"
                />
                <button
                  onClick={() => handleAdjustment('right')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <ArrowRight size={16} className="text-white" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleAdjustment('down')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <ArrowDown size={16} className="text-white" />
                </button>
              </div>
            </>
          ) : adjustmentType === 'rotation' ? (
            <>
              {/* Rotation Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleRotation(-rotationValue)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <RotateCcw size={16} className="text-white" />
                </button>
                <input
                  type="number"
                  value={rotationValue}
                  onChange={(e) => setRotationValue(Number(e.target.value))}
                  className="w-12 px-2 py-1 bg-white text-black rounded text-center text-sm"
                  min="1"
                  max="45"
                />
                <button
                  onClick={() => handleRotation(rotationValue)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <RotateCw size={16} className="text-white" />
                </button>
              </div>
              <div className="flex space-x-2 mt-2">
                <button 
                  onClick={() => handleRotation(-90)}
                  className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
                >
                  -90°
                </button>
                <button 
                  onClick={() => handleRotation(90)}
                  className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
                >
                  +90°
                </button>
                <button 
                  onClick={() => handleRotation(-180)}
                  className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
                >
                  -180°
                </button>
                <button 
                  onClick={() => handleRotation(180)}
                  className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
                >
                  +180°
                </button>
              </div>
            </>
          ) : adjustmentType === 'scale' ? (
            <>
              {/* Scale Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleScale('down')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <span className="text-white text-sm">-</span>
                </button>
                <input
                  type="number"
                  value={scaleValue}
                  onChange={(e) => setScaleValue(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-white text-black rounded text-center text-sm"
                  min="0.1"
                  max="1"
                  step="0.1"
                />
                <button
                  onClick={() => handleScale('up')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <span className="text-white text-sm">+</span>
                </button>
              </div>
              <div className="text-white text-xs text-center">
                Current Scale: {adjustmentMode === 'ap' ? apAdjustment.scale.toFixed(1) : mlAdjustment.scale.toFixed(1)}x
              </div>
            </>
          ) : (
            <>
              {/* Crop Controls */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => handleCropStart(adjustmentMode as 'ap' | 'ml')}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                >
                  Start Crop Selection
                </button>
                <div className="text-white text-xs text-center">
                  Click to start crop area, then click again to finish
                </div>
              </div>
            </>
          )}

          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleSaveAdjustment}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
            >
              Save Adjust
            </button>
            <button
              onClick={handleCancelAdjustment}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderControlButtons = () => {
    if (!segmentAdded) {
      return (
        <button
          onClick={handleAddBoneSegment}
          className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors duration-200"
        >
          Add Bone Segment Annotation
        </button>
      );
    }

    return (
      <div className="bg-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Segment 1</h4>
          <button
            onClick={handleResetSegment}
            className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        {!apSaved && !mlSaved && drawingMode === 'none' && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={handleDrawAP}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors duration-200"
            >
              Draw AP
            </button>
            <button
              onClick={handleDrawML}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors duration-200"
            >
              Draw ML
            </button>
          </div>
        )}
        
        {drawingMode === 'ap' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSaveAP}
                disabled={apPolygon.points.length < 3}
                className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition-colors duration-200"
              >
                Save AP
              </button>
              <button
                onClick={handleDiscardPolygon}
                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors duration-200"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {drawingMode === 'ml' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSaveML}
                disabled={mlPolygon.points.length < 3}
                className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition-colors duration-200"
              >
                Save ML
              </button>
              <button
                onClick={handleDiscardPolygon}
                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors duration-200"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {apSaved && !mlSaved && drawingMode === 'none' && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={handleEditAP}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors duration-200"
            >
              Edit AP
            </button>
            <button
              onClick={handleDrawML}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors duration-200"
            >
              Draw ML
            </button>
          </div>
        )}

        {!apSaved && mlSaved && drawingMode === 'none' && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={handleDrawAP}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors duration-200"
            >
              Draw AP
            </button>
            <button
              onClick={handleEditML}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors duration-200"
            >
              Edit ML
            </button>
          </div>
        )}

        {apSaved && mlSaved && drawingMode === 'none' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleEditAP}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors duration-200"
              >
                Edit AP
              </button>
              <button
                onClick={handleEditML}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors duration-200"
              >
                Edit ML
              </button>
              <button
                onClick={() => {
                  setAdjustmentMode('ap');
                  setCurrentMode('adjust');
                }}
                className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                  apAdjustmentSaved 
                    ? 'bg-green-500/30 text-green-100' 
                    : 'bg-blue-500/20 hover:bg-blue-500/30'
                }`}
              >
                {apAdjustmentSaved ? '✓ AP Saved' : 'Adjust AP'}
              </button>
              <button
                onClick={() => {
                  setAdjustmentMode('ml');
                  setCurrentMode('adjust');
                }}
                className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                  mlAdjustmentSaved 
                    ? 'bg-green-500/30 text-green-100' 
                    : 'bg-blue-500/20 hover:bg-blue-500/30'
                }`}
              >
                {mlAdjustmentSaved ? '✓ ML Saved' : 'Adjust ML'}
              </button>
            </div>
            <button
              onClick={handleDiscardPolygon}
              className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors duration-200"
            >
              Discard
            </button>
          </div>
        )}
      </div>
    );
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
        {/* Header with title and buttons */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">Bone Annotation</h2>
          <div className="flex space-x-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-2xl border border-gray-300 transition-all duration-300"
            >
              Back
            </button>
            <button
              onClick={handleFinalSave}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all duration-300"
            >
              {apAdjustmentSaved && mlAdjustmentSaved ? 'Next' : 'Save'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[750px] overflow-hidden">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 h-full">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 shadow-lg text-white h-full">
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

              {/* Annotation Controls */}
              <div className="space-y-6 overflow-y-auto max-h-[500px]">
                {renderControlButtons()}

                {/* Help Text */}
                <div className="bg-white/10 rounded-xl p-4 text-xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <span className="text-xs">?</span>
                    </div>
                  </div>
                  {drawingMode === 'ap' && (
                    <p>Click on the AP X-ray to create polygon points. Click near the first point to close the polygon.</p>
                  )}
                  {drawingMode === 'ml' && (
                    <p>Click on the ML X-ray to create polygon points. Click near the first point to close the polygon.</p>
                  )}
                  {currentMode === 'adjust' && (
                    <>
                      {adjustmentType === 'transition' && (
                        <p>Use Transition to move the polygon or Rotation to rotate it. Save both adjustments to proceed to Implant Templating.</p>
                      )}
                      {adjustmentType === 'rotation' && (
                        <p>Use the rotation controls to rotate the polygon. Adjust the rotation value and click the rotation buttons.</p>
                      )}
                      {adjustmentType === 'scale' && (
                        <p>Use the scale controls to resize the polygon. Click + to increase size or - to decrease size.</p>
                      )}
                      {adjustmentType === 'crop' && (
                        <p>Click "Start Crop Selection", then click two points on the image to define the crop area.</p>
                      )}
                    </>
                  )}
                  {currentMode === 'initial' && apAdjustmentSaved && mlAdjustmentSaved && (
                    <p>Both adjustments saved! Click "Next" to proceed to Implant Templating.</p>
                  )}
                  {currentMode === 'initial' && drawingMode === 'none' && !segmentAdded && (
                    <p>Click on "Add Bone Segment Annotation" to start creating polygon annotations on both X-ray images.</p>
                  )}
                  {currentMode === 'initial' && drawingMode === 'none' && segmentAdded && (!apSaved || !mlSaved) && (
                    <p>Click "Draw AP" or "Draw ML" to create polygon annotations on the respective X-ray images.</p>
                  )}
                  {cropMode !== 'none' && (
                    <p>Crop mode active. Click on the {cropMode.toUpperCase()} image to start selecting the crop area.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns - X-Ray Images */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* AP X-Ray */}
            <div className="bg-black rounded-3xl overflow-hidden shadow-lg flex items-center justify-center relative">
              <div
                ref={apImageRef}
                className={`aspect-[3/4] bg-black relative ${
                  drawingMode === 'ap' || cropMode === 'ap' ? 'cursor-crosshair' : 'cursor-default'
                }`}
                onClick={(e) => {
                  if (cropMode === 'ap') {
                    handleCropImageClick(e, 'ap');
                  } else {
                    handleImageClick(e, 'ap');
                  }
                }}
                onMouseMove={(e) => handleMouseMove(e, 'ap')}
                style={{
                  backgroundImage: patientData.apXrayImage 
                    ? `url("${patientData.apXrayImage}")`
                    : 'url("")',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  transform: `rotate(${currentApRotation}deg)`,
                  width: '100%',
                  height: '100%',
                  clipPath: apAdjustment.cropWidth < 100 || apAdjustment.cropHeight < 100 
                    ? `inset(${apAdjustment.cropY}% ${100 - apAdjustment.cropX - apAdjustment.cropWidth}% ${100 - apAdjustment.cropY - apAdjustment.cropHeight}% ${apAdjustment.cropX}%)`
                    : 'none',
                }}
              >
                {/* Background image is rendered via the style */}
                
                {/* Render AP polygon with mask and segment */}
                {renderPolygon(apPolygon, apAdjustment, apCenter, 'ap')}
                
                {/* Render crop overlay */}
                {renderCropOverlay('ap')}
                
                {/* Adjustment controls for AP */}
                {adjustmentMode === 'ap' && renderAdjustmentControls()}
              </div>
            </div>

            {/* ML X-Ray */}
            <div className="bg-black rounded-3xl overflow-hidden shadow-lg relative">
              <div
                ref={mlImageRef}
                className={`aspect-[3/4] bg-black relative ${
                  drawingMode === 'ml' || cropMode === 'ml' ? 'cursor-crosshair' : 'cursor-default'
                }`}
                onClick={(e) => {
                  if (cropMode === 'ml') {
                    handleCropImageClick(e, 'ml');
                  } else {
                    handleImageClick(e, 'ml');
                  }
                }}
                onMouseMove={(e) => handleMouseMove(e, 'ml')}
                style={{
                  backgroundImage: patientData.latXrayImage
                    ? `url("${patientData.latXrayImage}")`
                    : 'url("")',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  transform: `rotate(${currentLatRotation}deg)`,
                  clipPath: mlAdjustment.cropWidth < 100 || mlAdjustment.cropHeight < 100 
                    ? `inset(${mlAdjustment.cropY}% ${100 - mlAdjustment.cropX - mlAdjustment.cropWidth}% ${100 - mlAdjustment.cropY - mlAdjustment.cropHeight}% ${mlAdjustment.cropX}%)`
                    : 'none',
                  width: '100%',
                  height: '100%'
                }}
              >
                {/* Background image is rendered via the style */}
                
                {/* Render ML polygon with mask and segment */}
                {renderPolygon(mlPolygon, mlAdjustment, mlCenter, 'ml')}
                
                {/* Render crop overlay */}
                {renderCropOverlay('ml')}
                
                {/* Adjustment controls for ML */}
                {adjustmentMode === 'ml' && renderAdjustmentControls()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoneAnnotation;