'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useAREngine } from '@/hooks/useAREngine';
import type { ARProduct } from '@/lib/ar';

const ARTryOnPage = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const { state, start, stop, setProduct } = useAREngine();

  useEffect(() => {
    const product: ARProduct = {
      id: 'glasses-1',
      type: 'glasses',
      overlayUrl: '/test-ar/sunglasses.png',
    };
    setProduct(product);
  }, [setProduct]);

  const handleUserMedia = useCallback(() => {
    console.log('Camera ready');
    setIsVideoReady(true);
  }, []);

  useEffect(() => {
    if (!isVideoReady) return;

    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      console.log('Starting AR Engine', video.readyState);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      start(video, canvas);
    }
    
    return () => stop();
  }, [isVideoReady, start, stop]);

  return (
    <div style={{ position: 'relative', width: 640, height: 480 }}>
      {state.isLoading && <div>Loading AR model...</div>}
      {state.error && <div style={{ color: 'red' }}>Error: {state.error}</div>}
      
      <Webcam 
        ref={webcamRef} 
        mirrored
        onUserMedia={handleUserMedia}
        style={{ width: 640, height: 480 }}
        videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
      />
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: 640, 
          height: 480,
          pointerEvents: 'none' 
        }} 
      />
      
      <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', color: 'white', padding: 8 }}>
        <div>Video Ready: {isVideoReady ? 'Yes' : 'No'}</div>
        <div>Model Loaded: {state.isModelLoaded ? 'Yes' : 'No'}</div>
        <div>Detecting: {state.isDetecting ? 'Yes' : 'No'}</div>
        <div>Face: {state.faceDetected ? 'Detected' : 'Not found'}</div>
        <div>FPS: {state.fps}</div>
      </div>
    </div>
  );
};

export default ARTryOnPage;