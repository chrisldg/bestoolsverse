import { useEffect, useCallback } from 'react';

export const usePerformance = (componentName) => {
  useEffect(() => {
    // Mesurer le temps de montage
    const mountTime = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const totalTime = unmountTime - mountTime;
      
      if (totalTime > 1000) {
        console.warn(`${componentName} took ${totalTime}ms to render`);
      }
    };
  }, [componentName]);
  
  const measureAction = useCallback((actionName, action) => {
    const start = performance.now();
    const result = action();
    const end = performance.now();
    
    console.log(`${actionName} took ${end - start}ms`);
    return result;
  }, []);
  
  return { measureAction };
};