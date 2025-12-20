import React, { RefObject } from 'react';
import { Button } from '@/Components/ui/button';
import { RectangleGoggles } from 'lucide-react';
import { CameraView } from './CameraView';
import { ProductSelector } from './ProductSelector';
import type { Product } from '../types';

interface DualCameraViewProps {
  videoIRef: RefObject<HTMLVideoElement | null>;
  videoIIRef: RefObject<HTMLVideoElement | null>;
  canvasRefI: RefObject<HTMLCanvasElement | null>;
  canvasRefII: RefObject<HTMLCanvasElement | null>;
  arEnabledI: boolean;
  arEnabledII: boolean;
  swapLayout: boolean;
  
  productGlassesList: Product[];
  productHatList: Product[];
  
  selectedGlassProductI: number | null;
  selectedGlassProductII: number | null;
  selectedHatProductI: number | null;
  selectedHatProductII: number | null;
  
  showGlassListI: boolean;
  showGlassListII: boolean;
  showHatListI: boolean;
  showHatListII: boolean;
  
  onToggleGlassListI: () => void;
  onToggleGlassListII: () => void;
  onToggleHatListI: () => void;
  onToggleHatListII: () => void;
  
  onSelectGlassProductI: (index: number) => void;
  onSelectGlassProductII: (index: number) => void;
  onSelectHatProductI: (index: number) => void;
  onSelectHatProductII: (index: number) => void;
  
  onToggleARI: () => void;
  onToggleARII: () => void;
}

export function DualCameraView({
  videoIRef,
  videoIIRef,
  canvasRefI,
  canvasRefII,
  arEnabledI,
  arEnabledII,
  swapLayout,
  productGlassesList,
  productHatList,
  selectedGlassProductI,
  selectedGlassProductII,
  selectedHatProductI,
  selectedHatProductII,
  showGlassListI,
  showGlassListII,
  showHatListI,
  showHatListII,
  onToggleGlassListI,
  onToggleGlassListII,
  onToggleHatListI,
  onToggleHatListII,
  onSelectGlassProductI,
  onSelectGlassProductII,
  onSelectHatProductI,
  onSelectHatProductII,
  onToggleARI,
  onToggleARII,
}: DualCameraViewProps) {
  return (
    <>
      <div className={`absolute top-5 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${swapLayout ? 'right-3' : 'left-0'}`}>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <p className="text-white">Model I</p>
      </div>

      <ProductSelector
        products={productGlassesList}
        selectedIndex={selectedGlassProductI}
        onSelect={onSelectGlassProductI}
        show={showGlassListI}
        onToggle={onToggleGlassListI}
        icon="glasses"
        position="left"
        swapLayout={swapLayout}
        topOffset="top-20"
      />

      <ProductSelector
        products={productHatList}
        selectedIndex={selectedHatProductI}
        onSelect={onSelectHatProductI}
        show={showHatListI}
        onToggle={onToggleHatListI}
        icon="hat"
        position="left"
        swapLayout={swapLayout}
        topOffset="top-82"
      />

      <div className={`absolute top-5 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${swapLayout ? 'left-0' : 'right-3'}`}>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <p className="text-white">Model II</p>
      </div>

      <ProductSelector
        products={productGlassesList}
        selectedIndex={selectedGlassProductII}
        onSelect={onSelectGlassProductII}
        show={showGlassListII}
        onToggle={onToggleGlassListII}
        icon="glasses"
        position="right"
        swapLayout={swapLayout}
        topOffset="top-20"
      />

      <ProductSelector
        products={productHatList}
        selectedIndex={selectedHatProductII}
        onSelect={onSelectHatProductII}
        show={showHatListII}
        onToggle={onToggleHatListII}
        icon="hat"
        position="right"
        swapLayout={swapLayout}
        topOffset="top-82"
      />

      <div className={`flex flex-col h-full ${swapLayout ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        <div className="relative flex-1 px-0 md:px-1 lg:px-2 overflow-hidden rounded-2xl">
          <CameraView
            videoRef={videoIRef}
            canvasRef={canvasRefI}
            arEnabled={arEnabledI}
            className="w-full h-full"
          />
          
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-white">Camera I</p>
          </div>
          
          <Button
            onClick={onToggleARI}
            title="Bật Model I"
            className={`absolute top-4 right-4 p-4 size-12 rounded-full transition z-20 ${
              arEnabledI 
                ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' 
                : 'bg-orange-600/60 ring-4 ring-orange-600/30'
            }`}
          >
            <RectangleGoggles className="size-6 text-white" />
          </Button>
        </div>

        <div className="relative flex-1 px-0 md:px-1 lg:px-2 overflow-hidden rounded-2xl">
          <CameraView
            videoRef={videoIIRef}
            canvasRef={canvasRefII}
            arEnabled={arEnabledII}
            className="w-full h-full"
          />
          
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <p className="text-white">Camera II</p>
          </div>
          
          <Button
            onClick={onToggleARII}
            title="Bật Model II"
            className={`absolute size-12 top-4 right-4 p-4 rounded-full transition z-20 ${
              arEnabledII 
                ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' 
                : 'bg-orange-600/60 ring-4 ring-orange-600/30'
            }`}
          >
            <RectangleGoggles className="size-6 text-white" />
          </Button>
        </div>
      </div>
    </>
  );
}
