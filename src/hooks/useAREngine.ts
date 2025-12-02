'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { FaceLandmarkDetector } from '@/lib/ar/core/FaceLandmarkDetector';
import { GlassesRenderer } from '@/lib/ar/renderers/GlassesRenderer';
import type {
  AREngineState,
  ARSettings,
  ARProduct,
  FaceLandmarks,
  UseAREngineReturn,
  IARRenderer,
  AREngineConfig,
} from '@/lib/ar/types';
import { DEFAULT_AR_SETTINGS } from '@/lib/ar/types';

const initialState: AREngineState = {
  isLoading: false,
  isDetecting: false,
  isModelLoaded: false,
  error: null,
  faceDetected: false,
  fps: 0,
};

export function useAREngine(config?: Partial<AREngineConfig>): UseAREngineReturn {
  const [state, setState] = useState<AREngineState>(initialState);
  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);

  const detectorRef = useRef<FaceLandmarkDetector | null>(null);
  const rendererRef = useRef<IARRenderer | null>(null);
  const settingsRef = useRef<ARSettings>(DEFAULT_AR_SETTINGS);
  const productRef = useRef<ARProduct | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });

  const updateState = useCallback((updates: Partial<AREngineState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const detectionLoop = useCallback(async () => {
    if (!isRunningRef.current || !detectorRef.current || !videoRef.current) {
      return;
    }

    try {
      const detected = await detectorRef.current.detect(videoRef.current);

      if (detected) {
        setLandmarks(detected);
        updateState({ faceDetected: true });

        if (rendererRef.current && productRef.current) {
          rendererRef.current.render(detected, settingsRef.current, {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          });
        }
      } else {
        updateState({ faceDetected: false });
      }

      fpsCounterRef.current.frames++;
      const now = performance.now();
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        updateState({ fps: fpsCounterRef.current.frames });
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
      }
    } catch (error) {
      console.error('AR detection loop error:', error);
    }

    if (isRunningRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectionLoop);
    }
  }, [updateState]);

  const start = useCallback(
    async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
      try {
        updateState({ isLoading: true, error: null });

        videoRef.current = video;

        if (!detectorRef.current) {
          detectorRef.current = new FaceLandmarkDetector(config);
        }

        if (!detectorRef.current.isReady()) {
          await detectorRef.current.load();
        }

        updateState({ isModelLoaded: true });

        if (!rendererRef.current) {
          rendererRef.current = new GlassesRenderer();
        }
        rendererRef.current.init(canvas);

        if (productRef.current) {
          await rendererRef.current.setProduct(productRef.current);
        }

        updateState({ isLoading: false, isDetecting: true });
        isRunningRef.current = true;
        detectionLoop();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateState({
          isLoading: false,
          isDetecting: false,
          error: errorMessage,
        });
        console.error('AR Engine start error:', error);
      }
    },
    [config, detectionLoop, updateState]
  );

  const stop = useCallback(() => {
    isRunningRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    updateState({ isDetecting: false, faceDetected: false });
  }, [updateState]);

  const setProduct = useCallback(async (product: ARProduct) => {
    productRef.current = product;

    if (rendererRef.current) {
      try {
        await rendererRef.current.setProduct(product);
      } catch (error) {
        console.error('Failed to set product:', error);
      }
    }
  }, []);

  const setSettings = useCallback((newSettings: Partial<ARSettings>) => {
    settingsRef.current = { ...settingsRef.current, ...newSettings };
  }, []);

  useEffect(() => {
    return () => {
      stop();

      if (detectorRef.current) {
        detectorRef.current.dispose();
        detectorRef.current = null;
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [stop]);

  return {
    state,
    start,
    stop,
    setProduct,
    setSettings,
    landmarks,
  };
}
