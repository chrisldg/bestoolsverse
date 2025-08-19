// src/hooks/useImageLoader.js
export const useImageLoader = () => {
  const loadImage = useCallback((url, useCORS = true) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      if (useCORS && url.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Retry without CORS
        if (useCORS) {
          const imgFallback = new Image();
          imgFallback.onload = () => resolve(imgFallback);
          imgFallback.onerror = reject;
          imgFallback.src = url;
        } else {
          reject(new Error('Failed to load image'));
        }
      };
      
      img.src = url;
    });
  }, []);
  
  return { loadImage };
};