// src/utils/safeCanvas.js
export const getSafeCanvasContext = (canvasRef, type = '2d') => {
  if (!canvasRef.current) {
    console.error('Canvas ref is null');
    return null;
  }
  
  try {
    const ctx = canvasRef.current.getContext(type);
    if (!ctx) {
      console.error(`Failed to get ${type} context`);
      return null;
    }
    return ctx;
  } catch (error) {
    console.error('Canvas context error:', error);
    return null;
  }
};