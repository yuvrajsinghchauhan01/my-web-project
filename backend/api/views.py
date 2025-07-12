from ultralytics import YOLO
import os
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

def load_model():
    """Load the YOLOv8 model for circle detection"""
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'best.pt')
        if os.path.exists(model_path):
            model = YOLO(model_path)
            return model
        else:
            print(f"Model file not found at: {model_path}")
            return None
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

model = load_model()

def base64_to_image(base64_string):
    try:
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        image_data = base64.b64decode(base64_string)
        image = Image.open(BytesIO(image_data)).convert('RGB')
        return image
    except Exception as e:
        print(f"Error converting base64 to image: {e}")
        return None

@csrf_exempt
@require_http_methods(["POST"])
def detect_circles(request):
    try:
        data = json.loads(request.body)
        ap_image_base64 = data.get('ap_image')
        lat_image_base64 = data.get('lat_image')
        if not model:
            return JsonResponse({'error': 'Model not loaded. Please ensure best.pt is in the correct location.'}, status=500)
        results = {}
        # Process AP image
        if ap_image_base64:
            ap_image = base64_to_image(ap_image_base64)
            if ap_image:
                width, height = ap_image.size
                results_ap = model.predict(ap_image)
                boxes = results_ap[0].boxes
                if boxes is not None and len(boxes) > 0:
                    confs = boxes.conf.cpu().numpy()
                    all_boxes = boxes.xyxy.cpu().numpy()
                    clss = boxes.cls.cpu().numpy()
                    marker_indices = [i for i, c in enumerate(clss) if int(c) == 0]
                    if marker_indices:
                        idx = marker_indices[np.argmax(confs[marker_indices])]
                        box = all_boxes[idx]
                        conf = confs[idx]
                        x1, y1, x2, y2 = box[:4]
                        center_x = int((x1 + x2) / 2)
                        center_y = int((y1 + y2) / 2)
                        radius = int((x2 - x1) / 2)
                        results['ap'] = {
                            'center_x': center_x,
                            'center_y': center_y,
                            'radius': radius,
                            'confidence': float(conf),
                            'bbox': [int(x1), int(y1), int(x2), int(y2)],
                            'diameter_mm': 25,
                            'image_width': width,
                            'image_height': height
                        }
                    else:
                        results['ap'] = {'error': 'No calibration marker detected in AP image'}
                else:
                    results['ap'] = {'error': 'No circles detected in AP image'}
        # Process LAT image
        if lat_image_base64:
            lat_image = base64_to_image(lat_image_base64)
            if lat_image:
                width, height = lat_image.size
                results_lat = model.predict(lat_image)
                boxes = results_lat[0].boxes
                if boxes is not None and len(boxes) > 0:
                    confs = boxes.conf.cpu().numpy()
                    all_boxes = boxes.xyxy.cpu().numpy()
                    clss = boxes.cls.cpu().numpy()
                    marker_indices = [i for i, c in enumerate(clss) if int(c) == 0]
                    if marker_indices:
                        idx = marker_indices[np.argmax(confs[marker_indices])]
                        box = all_boxes[idx]
                        conf = confs[idx]
                        x1, y1, x2, y2 = box[:4]
                        center_x = int((x1 + x2) / 2)
                        center_y = int((y1 + y2) / 2)
                        radius = int((x2 - x1) / 2)
                        results['lat'] = {
                            'center_x': center_x,
                            'center_y': center_y,
                            'radius': radius,
                            'confidence': float(conf),
                            'bbox': [int(x1), int(y1), int(x2), int(y2)],
                            'diameter_mm': 25,
                            'image_width': width,
                            'image_height': height
                        }
                    else:
                        results['lat'] = {'error': 'No calibration marker detected in LAT image'}
                else:
                    results['lat'] = {'error': 'No circles detected in LAT image'}
        return JsonResponse(results)
    except Exception as e:
        return JsonResponse({'error': f'Error processing images: {str(e)}'}, status=500)
