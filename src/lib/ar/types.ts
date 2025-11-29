import type * as THREE from 'three';

// ============================================================
// FACE LANDMARK TYPES
// ============================================================

export interface FaceLandmarks {
  scaledMesh: number[][];
  boundingBox: BoundingBox;
  annotations?: FaceAnnotations;
}

export interface BoundingBox {
  topLeft: [number, number];
  bottomRight: [number, number];
}

export interface FaceAnnotations {
  leftEye: number[][];
  rightEye: number[][];
  leftEyebrow: number[][];
  rightEyebrow: number[][];
  noseTip: number[][];
  lips: number[][];
}

export interface EyeKeypoints {
  leftEye: [number, number, number];
  rightEye: [number, number, number];
  eyeCenter: [number, number, number];
  noseTip?: [number, number, number];
}

export const KEYPOINT_INDICES = {
  LEFT_EYE: 130,
  RIGHT_EYE: 359,
  EYE_CENTER: 168,
  NOSE_TIP: 1,
  LEFT_EAR: 234,
  RIGHT_EAR: 454,
  FOREHEAD: 10,
  CHIN: 152,
} as const;

// ============================================================
// TRANSFORM TYPES
// ============================================================

export interface ARTransform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface ARSettings {
  scale: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export const DEFAULT_AR_SETTINGS: ARSettings = {
  scale: 100,
  offsetX: 50,
  offsetY: 50,
  opacity: 100,
};

// ============================================================
// PRODUCT TYPES
// ============================================================

export type ARObjectType = 'glasses' | 'hat' | 'lipstick' | 'mask' | 'earring';  // mở rộng sau

export interface ARProduct {
  id: string;
  type: ARObjectType;
  overlayUrl: string;  //2d
  modelUrl?: string;   //3d
  anchorPoints?: AnchorConfig;
}

export interface AnchorConfig {
  primary: number;
  secondary?: number;
  offsetRatio: { x: number; y: number; z: number };
}

// ============================================================
// ENGINE TYPES
// ============================================================

export interface AREngineState {
  isLoading: boolean;
  isDetecting: boolean;
  isModelLoaded: boolean;
  error: string | null;
  faceDetected: boolean;
  fps: number;
}

export interface AREngineConfig {
  maxFaces: number;
  shouldLoadIrisModel: boolean;
  backend: 'webgl' | 'wasm' | 'cpu';   //chưa có kế hoạch cho wasm và cpu
  targetFPS: number;
}

export const DEFAULT_ENGINE_CONFIG: AREngineConfig = {
  maxFaces: 1,
  shouldLoadIrisModel: true,
  backend: 'webgl',
  targetFPS: 30,
};

// ============================================================
// RENDERER INTERFACE
// ============================================================

export interface IARRenderer {
  init(canvas: HTMLCanvasElement): void;
  render(landmarks: FaceLandmarks, settings: ARSettings, videoSize: VideoSize): void;
  setProduct(product: ARProduct): Promise<void>;
  dispose(): void;
  getScene(): THREE.Scene | null;
  getCamera(): THREE.Camera | null;
}

export interface VideoSize {
  width: number;
  height: number;
}

// ============================================================
// HOOK RETURN TYPES
// ============================================================

export interface UseAREngineReturn {
  state: AREngineState;
  start: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => Promise<void>;
  stop: () => void;
  setProduct: (product: ARProduct) => void;
  setSettings: (settings: Partial<ARSettings>) => void;
  landmarks: FaceLandmarks | null;
}

export interface UseFaceDetectionReturn {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  detect: (video: HTMLVideoElement) => Promise<FaceLandmarks | null>;
  load: () => Promise<void>;
}
