// Utility functions for capturing rendered images
export const captureElementAsImage = async (
  element: HTMLElement,
  options: {
    width?: number;
    height?: number;
    format?: 'png' | 'jpeg';
    quality?: number;
  } = {}
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const rect = element.getBoundingClientRect();
  canvas.width = options.width || rect.width;
  canvas.height = options.height || rect.height;

  // Create a new image from the element
  const data = await html2canvas(element, {
    canvas,
    width: canvas.width,
    height: canvas.height,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#000000'
  });

  return data.toDataURL(
    options.format === 'jpeg' ? 'image/jpeg' : 'image/png',
    options.quality || 0.9
  );
};

export const captureImageWithTransforms = async (
  imageUrl: string,
  transforms: {
    rotation?: number;
    translation?: { x: number; y: number };
    scale?: number;
    clipPath?: string;
  },
  canvasSize: { width: number; height: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Fill with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();
      
      // Move to center for rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      if (transforms.rotation) {
        ctx.rotate((transforms.rotation * Math.PI) / 180);
      }
      
      if (transforms.scale) {
        ctx.scale(transforms.scale, transforms.scale);
      }
      
      if (transforms.translation) {
        ctx.translate(transforms.translation.x, transforms.translation.y);
      }

      // Draw the image
      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );
      
      ctx.restore();

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};