import { useState, useRef, useEffect, useCallback } from 'react';
import { useAREngine } from '@/hooks/useAREngine';
import type { ARProduct } from '@/lib/ar';
import { ARObjectType } from '@/lib/ar/types';
import type { Product } from '../types';

export function useARControls(productGlassesList: Product[], productHatList: Product[]) {
  const arEngineI = useAREngine();
  const arEngineII = useAREngine();
  
  const arEngineIRef = useRef(arEngineI);
  const arEngineIIRef = useRef(arEngineII);
  
  arEngineIRef.current = arEngineI;
  arEngineIIRef.current = arEngineII;
  
  const [arEnabledI, setArEnabledI] = useState(false);
  const [arEnabledII, setArEnabledII] = useState(false);
  const [selectedGlassProductI, setSelectedGlassProductI] = useState<number | null>(null);
  const [selectedGlassProductII, setSelectedGlassProductII] = useState<number | null>(null);
  const [selectedHatProductI, setSelectedHatProductI] = useState<number | null>(null);
  const [selectedHatProductII, setSelectedHatProductII] = useState<number | null>(null);

  const arProductGlassSelectedI = useRef<ARProduct | null>(null);
  const arProductGlassSelectedII = useRef<ARProduct | null>(null);
  const arProductHatSelectedI = useRef<ARProduct | null>(null);
  const arProductHatSelectedII = useRef<ARProduct | null>(null);

  const canvasRefI = useRef<HTMLCanvasElement | null>(null);
  const canvasRefII = useRef<HTMLCanvasElement | null>(null);

  const createARProduct = useCallback((product: Product): ARProduct => {
    const hasModelUrl = Boolean(product.url);
    
    return {
      id: product._id,
      type: product.type as ARObjectType,
      modelUrl: hasModelUrl ? product.url : undefined,
      overlayUrl: hasModelUrl ? '' : product.thumbnailUrl,
      metadata: product.metadata,
    };
  }, []);

  const handleSelectedGlassProductI = useCallback((index: number) => {
    if (index < 0 || index >= productGlassesList.length) return;
    
    const arProduct = createARProduct(productGlassesList[index]);
    arEngineIRef.current.setProduct(arProduct);
    setSelectedGlassProductI(index);
    arProductGlassSelectedI.current = arProduct;
    if (!arEnabledI) setArEnabledI(true);
  }, [productGlassesList, createARProduct, arEnabledI]);

  const handleSelectedGlassProductII = useCallback((index: number) => {
    if (index < 0 || index >= productGlassesList.length) return;
    
    const arProduct = createARProduct(productGlassesList[index]);
    arEngineIIRef.current.setProduct(arProduct);
    setSelectedGlassProductII(index);
    arProductGlassSelectedII.current = arProduct;
    if (!arEnabledII) setArEnabledII(true);
  }, [productGlassesList, createARProduct, arEnabledII]);

  const handleSelectedHatProductI = useCallback((index: number) => {
    if (index < 0 || index >= productHatList.length) return;
    
    const arProduct = createARProduct(productHatList[index]);
    arEngineIRef.current.setProduct(arProduct);
    setSelectedHatProductI(index);
    arProductHatSelectedI.current = arProduct;
    if (!arEnabledI) setArEnabledI(true);
  }, [productHatList, createARProduct, arEnabledI]);

  const handleSelectedHatProductII = useCallback((index: number) => {
    if (index < 0 || index >= productHatList.length) return;
    
    const arProduct = createARProduct(productHatList[index]);
    arEngineIIRef.current.setProduct(arProduct);
    setSelectedHatProductII(index);
    arProductHatSelectedII.current = arProduct;
    if (!arEnabledII) setArEnabledII(true);
  }, [productHatList, createARProduct, arEnabledII]);

  const toggleARI = useCallback(() => {
    if (arEnabledI) {
      arEngineIRef.current.stop();
      setArEnabledI(false);
      setSelectedGlassProductI(null);
      setSelectedHatProductI(null);
    } else {
      setArEnabledI(true);
      if (productGlassesList.length > 0) {
        handleSelectedGlassProductI(0);
      }
    }
  }, [arEnabledI, productGlassesList.length, handleSelectedGlassProductI]);

  const toggleARII = useCallback(() => {
    if (arEnabledII) {
      arEngineIIRef.current.stop();
      setArEnabledII(false);
      setSelectedGlassProductII(null);
      setSelectedHatProductII(null);
    } else {
      setArEnabledII(true);
      if (productGlassesList.length > 0) {
        handleSelectedGlassProductII(0);
      }
    }
  }, [arEnabledII, productGlassesList.length, handleSelectedGlassProductII]);

  const resetAR = useCallback(() => {
    arEngineIRef.current.stop();
    arEngineIIRef.current.stop();
    setArEnabledI(false);
    setArEnabledII(false);
    setSelectedGlassProductI(null);
    setSelectedGlassProductII(null);
    setSelectedHatProductI(null);
    setSelectedHatProductII(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tryStartI = async () => {
      if (!arEnabledI) return;
      if (arEngineIRef.current.state.isDetecting) return;

      const maxAttempts = 30;
      let attempts = 0;

      while (!cancelled && attempts < maxAttempts) {
        const canvas = canvasRefI.current;
        const videos = document.querySelectorAll('video');
        const video = videos[0];

        if (video && canvas instanceof HTMLCanvasElement) {
          try {
            canvas.width = video.videoWidth || video.clientWidth;
            canvas.height = video.videoHeight || video.clientHeight;
            await arEngineIRef.current.start(video as HTMLVideoElement, canvas);
          } catch (err) {
            console.error('Failed to start AR engine I:', err);
          }
          return;
        }

        attempts++;
        await new Promise((res) => requestAnimationFrame(res));
      }

      if (!cancelled) {
        console.warn('Canvas for AR I did not become available in time.');
      }
    };

    tryStartI();

    return () => {
      cancelled = true;
    };
  }, [arEnabledI]);

  useEffect(() => {
    let cancelled = false;

    const tryStartII = async () => {
      if (!arEnabledII) return;
      if (arEngineIIRef.current.state.isDetecting) return;

      const maxAttempts = 30;
      let attempts = 0;

      while (!cancelled && attempts < maxAttempts) {
        const canvas = canvasRefII.current;
        const videos = document.querySelectorAll('video');
        const video = videos[1];

        if (video && canvas instanceof HTMLCanvasElement) {
          try {
            canvas.width = video.videoWidth || video.clientWidth;
            canvas.height = video.videoHeight || video.clientHeight;
            await arEngineIIRef.current.start(video as HTMLVideoElement, canvas);
          } catch (err) {
            console.error('Failed to start AR engine II:', err);
          }
          return;
        }

        attempts++;
        await new Promise((res) => requestAnimationFrame(res));
      }

      if (!cancelled) {
        console.warn('Canvas for AR II did not become available in time.');
      }
    };

    tryStartII();

    return () => {
      cancelled = true;
    };
  }, [arEnabledII]);

  const setSettingsI = useCallback((settings: Parameters<typeof arEngineI.setSettings>[0]) => {
    arEngineIRef.current.setSettings(settings);
  }, []);

  const setSettingsII = useCallback((settings: Parameters<typeof arEngineII.setSettings>[0]) => {
    arEngineIIRef.current.setSettings(settings);
  }, []);

  return {
    stateI: arEngineI.state,
    stateII: arEngineII.state,
    arEnabledI,
    arEnabledII,
    selectedGlassProductI,
    selectedGlassProductII,
    selectedHatProductI,
    selectedHatProductII,
    canvasRefI,
    canvasRefII,
    handleSelectedGlassProductI,
    handleSelectedGlassProductII,
    handleSelectedHatProductI,
    handleSelectedHatProductII,
    toggleARI,
    toggleARII,
    resetAR,
    setSettingsI,
    setSettingsII,
  };
}
