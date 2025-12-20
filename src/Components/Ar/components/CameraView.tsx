import React, { RefObject } from 'react';

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  arEnabled: boolean;
  className?: string;
}

export function CameraView({ 
  videoRef, 
  canvasRef, 
  arEnabled,
  className = '' 
}: CameraViewProps) {
  return (
    <div className={`relative w-full h-full max-w-full max-h-full ${className}`}>
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-full object-cover brightness-[1.15] contrast-[1.1] scale-x-[-1] block rounded-2xl"
      />
      {arEnabled && canvasRef && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        />
      )}
    </div>
  );
}
