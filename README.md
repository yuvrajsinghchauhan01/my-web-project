# Medical Image Analysis System

This project integrates a YOLO model for circle detection in medical X-ray images with a React frontend and Django backend.

## Project Structure

```
my-web-project/
├── frontend/          # React frontend application
├── backend/           # Django backend with ML model
├── best.pt           # YOLO model file (place this in backend/api/)
└── README.md
```

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Place your best.pt model file:**
   ```bash
   # Copy your best.pt file to backend/api/
   cp /path/to/your/best.pt backend/api/
   ```

5. **Run Django migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Start the Django server:**
   ```bash
   python manage.py runserver
   ```
   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## Features

### Circle Detection Integration

- **Auto Detection**: Click the "Auto Detect Marker" button in the Calibration page
- **Model Integration**: Uses your best.pt YOLO model for circle detection
- **Visual Feedback**: Displays detected circles with dashed yellow diameter lines
- **Diameter Display**: Shows the detected diameter (default 25mm) above each circle

### Image Manipulation

- **Translation**: Move bone segments in X and Y directions
- **Rotation**: Rotate bone segments around their center
- **Scale**: Resize bone segments (scale controls available)
- **Crop**: Crop bone segments to specific areas

### Workflow

1. **New Patient**: Create a new patient case
2. **Upload Images**: Upload AP and LAT X-ray images
3. **Calibration**: Use auto-detection or manually place markers
4. **Bone Annotation**: Draw polygons and adjust bone segments
5. **Implant Templating**: View final results with all manipulations

## API Endpoints

### POST /api/detect-circles/

Detects circles in uploaded X-ray images using the YOLO model.

**Request Body:**
```json
{
  "ap_image": "base64_encoded_image_data",
  "lat_image": "base64_encoded_image_data"
}
```

**Response:**
```json
{
  "ap": {
    "center_x": 150,
    "center_y": 200,
    "radius": 25,
    "confidence": 0.95,
    "image_with_circle": "base64_encoded_image_with_circle",
    "diameter_mm": 25
  },
  "lat": {
    "center_x": 180,
    "center_y": 220,
    "radius": 25,
    "confidence": 0.92,
    "image_with_circle": "base64_encoded_image_with_circle",
    "diameter_mm": 25
  }
}
```

## Troubleshooting

### Model Loading Issues

1. **Ensure best.pt is in the correct location:**
   ```bash
   ls backend/api/best.pt
   ```

2. **Check model file permissions:**
   ```bash
   chmod 644 backend/api/best.pt
   ```

3. **Verify PyTorch installation:**
   ```bash
   python -c "import torch; print(torch.__version__)"
   ```

### CORS Issues

If you encounter CORS errors, ensure the backend is running and the frontend is making requests to the correct URL (`http://localhost:8000`).

### Dependencies Issues

If you encounter dependency conflicts:

1. **Recreate virtual environment:**
   ```bash
   rm -rf venv
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Update pip:**
   ```bash
   pip install --upgrade pip
   ```

## Development Notes

- The backend uses Django 4.2.18 with CORS support
- The frontend uses React with TypeScript and Tailwind CSS
- Image processing uses OpenCV and PIL
- The YOLO model is loaded once at startup for efficiency
- All image manipulations are preserved and forwarded between pages

## Model Integration

The system expects your `best.pt` model to:
- Detect circular objects in X-ray images
- Return bounding box coordinates (x1, y1, x2, y2)
- Provide confidence scores for detections

The backend automatically:
- Converts bounding boxes to circle centers and radii
- Draws dashed diameter lines on detected circles
- Displays diameter measurements
- Handles both AP and LAT image processing 