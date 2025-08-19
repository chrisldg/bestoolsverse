// src/tools/VRStudio.jsx
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Glasses, Cube, Globe, Play, Pause, RotateCw, Download, Share2, Settings, Camera, Maximize2 } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const VRStudio = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [scene, setScene] = useState('space');
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState('360');
  const [sceneSettings, setSceneSettings] = useState({
    speed: 1,
    quality: 'high',
    fov: 75,
    ambientLight: 0.5
  });
  const [rotation, setRotation] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [sceneCache, setSceneCache] = useState({});

  const getCachedElement = (key, drawFunction) => {
    if (!sceneCache[key]) {
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = 200;
      offscreenCanvas.height = 200;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      drawFunction(offscreenCtx);
      sceneCache[key] = offscreenCanvas;
    }
    return sceneCache[key];
  };

  const scenes = {
    space: {
      name: 'Espace',
      description: 'Voyage dans l\'espace infini',
      color: '#000033'
    },
    ocean: {
      name: 'Océan',
      description: 'Exploration sous-marine',
      color: '#006994'
    },
    forest: {
      name: 'Forêt',
      description: 'Promenade en forêt enchantée',
      color: '#228B22'
    },
    city: {
      name: 'Ville futuriste',
      description: 'Métropole cyberpunk',
      color: '#4B0082'
    },
    desert: {
      name: 'Désert',
      description: 'Dunes infinies',
      color: '#EDC9AF'
    },
    abstract: {
      name: 'Abstrait',
      description: 'Monde géométrique',
      color: '#FF1493'
    }
  };

  const viewModes = [
    { id: '360', name: 'Vue 360°', description: 'Panoramique complet' },
    { id: 'vr', name: 'Mode VR', description: 'Pour casque VR' },
    { id: 'stereo', name: 'Stéréoscopique', description: 'Vision 3D' }
  ];

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('wheel', handleWheel);
      
      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('wheel', handleWheel);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isDragging, cameraRotation]);

  useEffect(() => {
    if (canvasRef.current && isPlaying) {
      drawVRScene();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scene, isPlaying, sceneSettings, viewMode, zoom]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - mousePos.x;
      const deltaY = e.clientY - mousePos.y;
      
      setCameraRotation({
        x: cameraRotation.x + deltaY * 0.5,
        y: cameraRotation.y + deltaX * 0.5
      });
      
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => Math.max(0.5, Math.min(3, prevZoom * delta)));
  };

  const drawVRScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Impossible d\'obtenir le contexte 2D');
      return;
    }
    const width = canvas.width;
    const height = canvas.height;
    
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = scenes[scene].color;
      ctx.fillRect(0, 0, width, height);
      
      // Apply camera transformations
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.rotate((cameraRotation.y * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);
      
      // Draw scene elements based on selected scene
      switch (scene) {
        case 'space':
          drawSpaceScene(ctx, width, height, rotation);
          break;
        case 'ocean':
          drawOceanScene(ctx, width, height, rotation);
          break;
        case 'forest':
          drawForestScene(ctx, width, height, rotation);
          break;
        case 'city':
          drawCityScene(ctx, width, height, rotation);
          break;
        case 'desert':
          drawDesertScene(ctx, width, height, rotation);
          break;
        case 'abstract':
          drawAbstractScene(ctx, width, height, rotation);
          break;
      }
      
      ctx.restore();
      
      // Draw stereo view if enabled
      if (viewMode === 'stereo') {
        drawStereoView(ctx, width, height);
      }
      
      if (isPlaying) {
        setRotation(prevRotation => {
          // Réinitialiser la rotation pour éviter les valeurs trop grandes
          const newRotation = prevRotation + 0.01 * sceneSettings.speed;
          return newRotation > Math.PI * 2 ? newRotation - Math.PI * 2 : newRotation;
        });
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  const drawStereoView = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    
    // Left eye (red channel)
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width / 2, height);
    
    // Right eye (cyan channel)
    ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.fillRect(width / 2, 0, width / 2, height);
    
    ctx.globalCompositeOperation = 'source-over';
  };

  const drawSpaceScene = (ctx, width, height, rotation) => {
    // Stars with parallax effect
    for (let layer = 0; layer < 3; layer++) {
      const starCount = 100 - layer * 20;
      const speed = 1 + layer * 0.5;
      
      for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2 + rotation * speed;
        const distance = 100 + Math.sin(i * 0.1) * 50 + layer * 50;
        const x = width/2 + Math.cos(angle) * distance;
        const y = height/2 + Math.sin(angle) * distance;
        const size = (3 - layer) * (1 + Math.sin(rotation * 5 + i) * 0.3);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - layer * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Planets
    const planets = [
      { size: 80, color: '#4169E1', orbit: 200, speed: 0.5 },
      { size: 40, color: '#FF6347', orbit: 300, speed: 0.8 },
      { size: 60, color: '#32CD32', orbit: 400, speed: 0.3 }
    ];
    
    planets.forEach((planet, index) => {
      const angle = rotation * planet.speed + index * 2;
      const x = width/2 + Math.cos(angle) * planet.orbit;
      const y = height/2 + Math.sin(angle) * planet.orbit * 0.5;
      
      // Planet shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(x + 5, y + 5, planet.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Planet
      const gradient = ctx.createRadialGradient(x - planet.size/3, y - planet.size/3, 0, x, y, planet.size);
      gradient.addColorStop(0, planet.color);
      gradient.addColorStop(1, adjustBrightness(planet.color, -50));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, planet.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawOceanScene = (ctx, width, height, rotation) => {
    // Water gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#001F3F');
    gradient.addColorStop(0.5, '#003F7F');
    gradient.addColorStop(1, '#00274D');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Waves with realistic motion
    ctx.strokeStyle = '#00CED1';
    ctx.lineWidth = 3;
    
    for (let layer = 0; layer < 5; layer++) {
      ctx.globalAlpha = 0.7 - layer * 0.1;
      ctx.beginPath();
      
      for (let x = 0; x < width; x += 5) {
        const waveHeight = 30 + layer * 10;
        const frequency = 0.02 - layer * 0.002;
        const y = height/2 + 
                  Math.sin((x + rotation * 100) * frequency) * waveHeight + 
                  Math.sin((x + rotation * 150) * frequency * 2) * waveHeight/2 +
                  layer * 30;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    
    // Fish schools
    ctx.globalAlpha = 1;
    for (let i = 0; i < 5; i++) {
      const schoolX = width/2 + Math.sin(rotation * 2 + i) * 200;
      const schoolY = height/2 + Math.cos(rotation * 1.5 + i) * 100;
      
      for (let j = 0; j < 8; j++) {
        const fishX = schoolX + Math.cos(j * 0.8) * 30;
        const fishY = schoolY + Math.sin(j * 0.8) * 20;
        const fishAngle = rotation * 3 + j;
        
        ctx.save();
        ctx.translate(fishX, fishY);
        ctx.rotate(fishAngle);
        
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(20, -5);
        ctx.lineTo(20, 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      }
    }
    
    // Bubbles
    for (let i = 0; i < 20; i++) {
      const bubbleX = (i * 100 + rotation * 50) % width;
      const bubbleY = height - (rotation * 100 + i * 50) % height;
      const size = 3 + Math.sin(i) * 2;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawForestScene = (ctx, width, height, rotation) => {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#98D8E8');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height * 0.6);
    
    // Ground
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, height * 0.6, width, height * 0.4);
    
    // Trees with depth
    const treeLayers = 3;
    for (let layer = treeLayers - 1; layer >= 0; layer--) {
      const treeCount = 8 - layer * 2;
      const layerOffset = layer * 50;
      
      for (let i = 0; i < treeCount; i++) {
        const baseX = (width / treeCount) * i + Math.sin(rotation + i + layer) * 20;
        const treeHeight = 150 + Math.sin(i) * 50 - layer * 30;
        const treeY = height - treeHeight - layerOffset;
        
        // Tree trunk
        ctx.fillStyle = `rgb(${139 - layer * 20}, ${69 - layer * 10}, 19)`;
        ctx.fillRect(baseX - 15, treeY, 30, treeHeight);
        
        // Tree leaves (multiple circles for fuller effect)
        const leafColor = `rgb(${34 - layer * 10}, ${139 - layer * 20}, ${34 - layer * 10})`;
        ctx.fillStyle = leafColor;
        
        for (let j = 0; j < 3; j++) {
          const leafX = baseX + Math.sin(rotation * 2 + j) * 10;
          const leafY = treeY - 30 + j * 20;
          const leafSize = 60 - layer * 10 - j * 5;
          
          ctx.beginPath();
          ctx.arc(leafX, leafY, leafSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Swaying effect
        if (layer === 0) {
          const swayAngle = Math.sin(rotation * 3 + i) * 0.05;
          ctx.save();
          ctx.translate(baseX, treeY);
          ctx.rotate(swayAngle);
          ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
          ctx.beginPath();
          ctx.arc(0, -50, 70, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }
    
    // Falling leaves
    for (let i = 0; i < 10; i++) {
      const leafX = (i * 100 + rotation * 30) % width;
      const leafY = (rotation * 50 + i * 100) % height;
      const leafRotation = rotation * 5 + i;
      
      ctx.save();
      ctx.translate(leafX, leafY);
      ctx.rotate(leafRotation);
      ctx.fillStyle = '#CD853F';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const drawCityScene = (ctx, width, height, rotation) => {
    // Night sky
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, width, height);
    
    // Stars
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = 'white';
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height * 0.5,
        1, 1
      );
    }
    
    // Buildings with perspective
    const buildingCount = 15;
    const buildings = [];
    
    // Generate building data
    for (let i = 0; i < buildingCount; i++) {
      buildings.push({
        x: (width / buildingCount) * i,
        width: 60 + Math.random() * 40,
        height: 150 + Math.random() * 200,
        depth: Math.random() * 3
      });
    }
    
    // Sort by depth and draw
    buildings.sort((a, b) => b.depth - a.depth);
    
    buildings.forEach((building, index) => {
      const parallax = building.depth * 20;
      const x = building.x + Math.sin(rotation) * parallax;
      const opacity = 1 - building.depth * 0.2;
      
      // Building body
      ctx.fillStyle = `rgba(72, 61, 139, ${opacity})`;
      ctx.fillRect(x, height - building.height, building.width, building.height);
      
      // Building outline
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, height - building.height, building.width, building.height);
      
      // Windows with animation
      ctx.fillStyle = '#FFFF00';
      const windowRows = Math.floor(building.height / 25);
      const windowCols = Math.floor(building.width / 20);
      
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
          const windowOn = Math.sin(rotation * 2 + row + col + index) > 0;
          if (windowOn) {
            ctx.fillStyle = `rgba(255, 255, 0, ${opacity})`;
            ctx.fillRect(
              x + col * 20 + 5,
              height - building.height + row * 25 + 5,
              10, 15
            );
          }
        }
      }
      
      // Neon signs on some buildings
      if (index % 3 === 0) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FF00FF';
        ctx.strokeStyle = '#FF00FF';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 10, height - building.height + 20, building.width - 20, 30);
        ctx.shadowBlur = 0;
      }
    });
    
    // Flying vehicles
    for (let i = 0; i < 3; i++) {
      const vehicleX = (rotation * 200 + i * 200) % (width + 100) - 50;
      const vehicleY = 50 + Math.sin(rotation + i) * 30 + i * 40;
      
      // Vehicle light trail
      const gradient = ctx.createLinearGradient(vehicleX - 50, vehicleY, vehicleX, vehicleY);
      gradient.addColorStop(0, 'rgba(255, 255, 0, 0)');
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(vehicleX - 50, vehicleY - 2, 50, 4);
      
      // Vehicle body
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(vehicleX, vehicleY - 5, 20, 10);
    }
  };

  const drawDesertScene = (ctx, width, height, rotation) => {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(0.5, '#FFA500');
    skyGradient.addColorStop(1, '#FF8C00');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Sun
    const sunY = 100 + Math.sin(rotation * 0.5) * 30;
    const sunGradient = ctx.createRadialGradient(width - 100, sunY, 0, width - 100, sunY, 50);
    sunGradient.addColorStop(0, '#FFFF00');
    sunGradient.addColorStop(0.5, '#FFD700');
    sunGradient.addColorStop(1, '#FFA500');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(width - 100, sunY, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Heat waves effect
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 10; i++) {
      const waveY = height * 0.7 + i * 10;
      ctx.strokeStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(0, waveY);
      for (let x = 0; x < width; x += 10) {
        const offsetY = Math.sin((x + rotation * 100) * 0.02 + i) * 5;
        ctx.lineTo(x, waveY + offsetY);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // Sand dunes with shading
    for (let layer = 0; layer < 5; layer++) {
      const baseColor = 244 - layer * 20;
      ctx.fillStyle = `rgb(${baseColor}, ${baseColor - 40}, ${baseColor - 84})`;
      
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      for (let x = 0; x <= width; x += 20) {
        const duneHeight = Math.sin((x + rotation * 50 + layer * 100) * 0.01) * 80 + 
                          Math.sin((x + rotation * 30 + layer * 50) * 0.02) * 40;
        const y = height - 50 - duneHeight - layer * 30;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      
      // Dune shadows
      ctx.fillStyle = `rgba(0, 0, 0, ${0.2 - layer * 0.03})`;
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      for (let x = 0; x <= width; x += 20) {
        const duneHeight = Math.sin((x + rotation * 50 + layer * 100) * 0.01) * 80 + 
                          Math.sin((x + rotation * 30 + layer * 50) * 0.02) * 40;
        const y = height - 45 - duneHeight - layer * 30;
        ctx.lineTo(x + 10, y);
      }
      
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    }
    
    // Cactus
    const cactusX = width * 0.3;
    const cactusY = height - 150;
    ctx.fillStyle = '#228B22';
    ctx.fillRect(cactusX, cactusY, 30, 100);
    ctx.fillRect(cactusX - 20, cactusY + 30, 20, 40);
    ctx.fillRect(cactusX + 30, cactusY + 50, 20, 30);
  };

  const drawAbstractScene = (ctx, width, height, rotation) => {
    // Dynamic background
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
    const hue = (rotation * 50) % 360;
    bgGradient.addColorStop(0, `hsl(${hue}, 50%, 20%)`);
    bgGradient.addColorStop(1, `hsl(${(hue + 180) % 360}, 50%, 10%)`);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Geometric shapes with complex animations
    const shapes = 15;
    
    for (let i = 0; i < shapes; i++) {
      const angle = (i / shapes) * Math.PI * 2 + rotation;
      const radius = 150 + Math.sin(rotation * 2 + i) * 50;
      const x = width/2 + Math.cos(angle) * radius;
      const y = height/2 + Math.sin(angle) * radius;
      const size = 30 + Math.sin(rotation + i) * 20;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation + i);
      
      // Shape color with animation
      const shapeHue = (i * 30 + rotation * 100) % 360;
      ctx.fillStyle = `hsla(${shapeHue}, 70%, 50%, 0.8)`;
      ctx.strokeStyle = `hsl(${shapeHue}, 90%, 70%)`;
      ctx.lineWidth = 2;
      
      // Draw different shapes
      ctx.beginPath();
      if (i % 3 === 0) {
        // Morphing square
        const morph = Math.sin(rotation * 3 + i) * 0.3;
        ctx.moveTo(-size/2, -size/2);
        ctx.quadraticCurveTo(0, -size/2 - size * morph, size/2, -size/2);
        ctx.quadraticCurveTo(size/2 + size * morph, 0, size/2, size/2);
        ctx.quadraticCurveTo(0, size/2 + size * morph, -size/2, size/2);
        ctx.quadraticCurveTo(-size/2 - size * morph, 0, -size/2, -size/2);
      } else if (i % 3 === 1) {
        // Pulsating circle
        const pulse = 1 + Math.sin(rotation * 5 + i) * 0.2;
        ctx.arc(0, 0, size/2 * pulse, 0, Math.PI * 2);
      } else {
        // Rotating triangle
        for (let j = 0; j < 3; j++) {
          const triAngle = (j / 3) * Math.PI * 2 + rotation * 2;
          const px = Math.cos(triAngle) * size/2;
          const py = Math.sin(triAngle) * size/2;
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      }
      
      ctx.fill();
      ctx.stroke();
      
      // Add glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = ctx.fillStyle;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.restore();
      
      // Connecting lines
      if (i < shapes - 1) {
        const nextAngle = ((i + 1) / shapes) * Math.PI * 2 + rotation;
        const nextRadius = 150 + Math.sin(rotation * 2 + i + 1) * 50;
        const nextX = width/2 + Math.cos(nextAngle) * nextRadius;
        const nextY = height/2 + Math.sin(nextAngle) * nextRadius;
        
        ctx.strokeStyle = `hsla(${shapeHue}, 70%, 50%, 0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();
      }
    }
    
    // Center focal point
    const centerSize = 50 + Math.sin(rotation * 3) * 20;
    const centerGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, centerSize);
    centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    centerGradient.addColorStop(0.5, `hsla(${hue}, 70%, 50%, 0.5)`);
    centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.arc(width/2, height/2, centerSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const adjustBrightness = (color, amount) => {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      drawVRScene();
    }
  };

  const resetView = () => {
    setCameraRotation({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const exportVRScene = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `vr-scene-${scene}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    trackEvent('vr_studio', 'export_scene', scene);
  };

  const shareScene = () => {
    const shareData = {
      title: `Scène VR - ${scenes[scene].name}`,
      text: `Découvrez cette incroyable scène VR créée avec BestoolsVerse !`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
    
    trackEvent('vr_studio', 'share_scene');
  };

  const captureScreenshot = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Add watermark
    ctx.save();
    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText('BestoolsVerse VR Studio', canvas.width - 10, canvas.height - 10);
    ctx.restore();
    
    // Download
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `vr-capture-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    trackEvent('vr_studio', 'capture_screenshot');
  };

  const enterFullVR = () => {
    if (canvasRef.current?.requestFullscreen) {
      canvasRef.current.requestFullscreen();
      setViewMode('vr');
    }
    trackEvent('vr_studio', 'enter_vr_mode');
  };

  return (
    <Layout 
      title="Studio VR - Générateur de Réalité Virtuelle" 
      description="Créez des expériences de réalité virtuelle immersives. Générateur de scènes VR 360° pour casques VR et navigateurs."
      keywords="réalité virtuelle, vr studio, création vr, scène 360, webvr"
    >
      <Helmet>
        <title>Studio VR - Générateur de Réalité Virtuelle | BestoolsVerse</title>
        <meta name="description" content="Créez des expériences de réalité virtuelle immersives. Générateur de scènes VR 360° pour casques VR et navigateurs." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="flex items-center text-blue-500 hover:text-blue-400 transition-colors mb-4">
              <ChevronLeft size={20} className="mr-2" />
              <span>Retour à BestoolsVerse</span>
            </a>
            <h1 className="text-3xl font-bold text-white">Studio VR</h1>
            <p className="text-gray-400 mt-2">Créez des mondes virtuels immersifs</p>
          </div>
          <Glasses className="text-purple-500" size={48} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panneau de contrôle */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sélection de scène */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Environnement VR</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(scenes).map(([key, sceneData]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setScene(key);
                      trackEvent('vr_studio', 'change_scene', key);
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      scene === key
                        ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                    }`}
                  >
                    <div 
                      className="w-full h-12 rounded mb-2" 
                      style={{ backgroundColor: sceneData.color }}
                    />
                    <div className="text-sm font-medium text-white">{sceneData.name}</div>
                    <div className="text-xs text-gray-400">{sceneData.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode de vue */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Mode de visualisation</h3>
              
              <div className="space-y-3">
                {viewModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      viewMode === mode.id
                        ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-white">{mode.name}</div>
                    <div className="text-sm text-gray-400">{mode.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Paramètres */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Paramètres</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Vitesse d'animation</label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={sceneSettings.speed}
                    onChange={(e) => setSceneSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Lent</span>
                    <span>{sceneSettings.speed}x</span>
                    <span>Rapide</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Champ de vision</label>
                  <input
                    type="range"
                    min="60"
                    max="120"
                    value={sceneSettings.fov}
                    onChange={(e) => setSceneSettings(prev => ({ ...prev, fov: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-center text-xs text-gray-500 mt-1">{sceneSettings.fov}°</div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Qualité</label>
                  <select
                    value={sceneSettings.quality}
                    onChange={(e) => setSceneSettings(prev => ({ ...prev, quality: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Zone de visualisation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Canvas VR */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Aperçu VR</h3>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button
                    onClick={resetView}
                    className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <RotateCw size={20} />
                  </button>
                  <button
                    onClick={enterFullVR}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Maximize2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full h-96 bg-black cursor-move"
                  style={{ touchAction: 'none' }}
                />
                
                {viewMode === 'vr' && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-4 py-2 rounded-lg">
                    <p className="text-white text-sm">Mode VR activé - Connectez votre casque</p>
                  </div>
                )}
                
                {viewMode === 'stereo' && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-4 py-2 rounded-lg">
                    <p className="text-white text-sm">Vue stéréoscopique - Utilisez des lunettes 3D</p>
                  </div>
                )}
                
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-lg">
                  <p className="text-white text-sm">
                    Zoom: {(zoom * 100).toFixed(0)}% | 
                    Rotation: {Math.abs(cameraRotation.y % 360).toFixed(0)}°
                  </p>
                </div>
              </div>
            </div>

            {/* Contrôles et informations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h4 className="font-semibold text-white mb-3">Contrôles VR</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Cliquez et glissez pour regarder autour</p>
                  <p>• Molette pour zoomer/dézoomer</p>
                  <p>• Double-clic pour recentrer la vue</p>
                  <p>• Échap pour quitter le mode plein écran</p>
                </div>
              </div>
              
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h4 className="font-semibold text-white mb-3">Informations de la scène</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Environnement</span>
                    <span className="text-white">{scenes[scene].name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mode</span>
                    <span className="text-white">{viewModes.find(m => m.id === viewMode)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">FPS</span>
                    <span className="text-white">60</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Résolution</span>
                    <span className="text-white">800x600</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={exportVRScene}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download size={20} className="mr-2" />
                Exporter la scène
              </button>
              <button
                onClick={shareScene}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center"
              >
                <Share2 size={20} className="mr-2" />
                Partager
              </button>
              <button
                onClick={captureScreenshot}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center"
              >
                <Camera size={20} className="mr-2" />
                Capture
              </button>
            </div>

            {/* Informations */}
            <div className="bg-purple-900 bg-opacity-20 rounded-lg p-4 border border-purple-800">
              <h4 className="font-semibold text-purple-400 mb-2">À propos de la VR</h4>
              <p className="text-sm text-gray-300">
                Ce studio VR vous permet de créer et d'explorer des environnements virtuels directement 
                dans votre navigateur. Compatible avec la plupart des casques VR via WebXR, 
                ou explorez simplement avec votre souris en mode 360°.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VRStudio;