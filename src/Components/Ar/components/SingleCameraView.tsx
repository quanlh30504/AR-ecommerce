import React, { RefObject } from 'react';
import { Button } from '@/Components/ui/button';
import { RectangleGoggles, Camera, Box } from 'lucide-react';

import { ProductSelector } from './ProductSelector';
import { Model3DViewer } from './Model3DViewer';
import type { Product } from '../types';

export type ViewMode = 'camera' | '3d-viewer';
export type ProductType = 'glasses' | 'hat' | null;

interface SingleCameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  arEnabled: boolean;
  
  productGlassesList: Product[];
  productHatList: Product[];
  
  selectedGlassProduct: number | null;
  selectedHatProduct: number | null;
  lastSelectedType: ProductType;
  
  showGlassList: boolean;
  showHatList: boolean;
  
  onToggleGlassList: () => void;
  onToggleHatList: () => void;
  
  onSelectGlassProduct: (index: number) => void;
  onSelectHatProduct: (index: number) => void;
  
  onToggleAR: () => void;
  
  viewMode: ViewMode;
  onToggleViewMode: () => void;
}

export function SingleCameraView({
  videoRef,
  canvasRef,
  arEnabled,
  productGlassesList,
  productHatList,
  selectedGlassProduct,
  selectedHatProduct,
  lastSelectedType,
  showGlassList,
  showHatList,
  onToggleGlassList,
  onToggleHatList,
  onSelectGlassProduct,
  onSelectHatProduct,
  onToggleAR,
  viewMode,
  onToggleViewMode,
}: SingleCameraViewProps) {
  // Use lastSelectedType to determine which product to show in 3D viewer
  const selectedProduct = lastSelectedType === 'hat' && selectedHatProduct !== null
    ? productHatList[selectedHatProduct]
    : selectedGlassProduct !== null 
      ? productGlassesList[selectedGlassProduct] 
      : selectedHatProduct !== null 
        ? productHatList[selectedHatProduct]
        : null;
  
  const modelUrl = selectedProduct?.url || null;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {/* View Mode Toggle */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex bg-black/70 backdrop-blur-sm rounded-full p-1 gap-0.5">
        <Button
          onClick={viewMode === '3d-viewer' ? onToggleViewMode : undefined}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            viewMode === 'camera'
              ? 'bg-indigo-500 text-white shadow-lg'
              : 'bg-transparent text-white/70 hover:text-white hover:bg-white/10'
          }`}
          variant="ghost"
        >
          <Camera className="w-4 h-4" />
          AR Try-On
        </Button>
        <Button
          onClick={viewMode === 'camera' ? onToggleViewMode : undefined}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            viewMode === '3d-viewer'
              ? 'bg-indigo-500 text-white shadow-lg'
              : 'bg-transparent text-white/70 hover:text-white hover:bg-white/10'
          }`}
          variant="ghost"
        >
          <Box className="w-4 h-4" />
          3D Viewer
        </Button>
      </div>

      <div className="absolute top-3 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 right-3">
        <div className={`w-2 h-2 rounded-full animate-pulse ${viewMode === 'camera' ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
        <p className="text-white">{viewMode === 'camera' ? 'Model I' : '3D View'}</p>
      </div>

      <ProductSelector
        products={productGlassesList}
        selectedIndex={selectedGlassProduct}
        onSelect={onSelectGlassProduct}
        show={showGlassList}
        onToggle={onToggleGlassList}
        icon="glasses"
        position="right"
        topOffset="top-15"
      />

      <ProductSelector
        products={productHatList}
        selectedIndex={selectedHatProduct}
        onSelect={onSelectHatProduct}
        show={showHatList}
        onToggle={onToggleHatList}
        icon="hat"
        position="right"
        topOffset="top-72"
      />

      <div className="w-full max-w-[80%] max-h-[95%] border-0 rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center">
        {/* Camera view - always rendered but hidden when in 3D mode */}
        <div className={viewMode === 'camera' ? 'contents' : 'hidden'}>
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="max-w-full max-h-full object-contain brightness-[1.15] contrast-[1.1] scale-x-[-1] block rounded-2xl"
          />
          {arEnabled && canvasRef && (
            <canvas
              ref={canvasRef}
              className="absolute max-w-full max-h-full object-contain pointer-events-none z-10 rounded-2xl"
            />
          )}
        </div>
        
        {/* 3D Viewer - only render when in 3D mode */}
        {viewMode === '3d-viewer' && (
          <Model3DViewer 
            modelUrl={modelUrl} 
            className="w-full h-full min-h-100 rounded-2xl" 
          />
        )}
      </div>

      {viewMode === 'camera' && (
        <div className="absolute top-20 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <p className="text-white">Camera I</p>
        </div>
      )}

      {viewMode === 'camera' && (
        <Button
          onClick={onToggleAR}
          title="Bật Model"
          className={`absolute size-12 top-40 left-10 p-4 rounded-full transition z-20 ${
            arEnabled 
              ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' 
              : 'bg-orange-600/60 ring-4 ring-orange-600/30'
          }`}
        >
          <RectangleGoggles className="size-6 text-white" />
        </Button>
      )}
    </div>
  );
}
