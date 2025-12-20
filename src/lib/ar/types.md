# Types Documentation

## 1. Face Landmark Types

### `FaceLandmarks`
```typescript
export interface FaceLandmarks {
  scaledMesh: number[][];        // Array of 468 3D points [x, y, z] of face
  boundingBox: BoundingBox;      // Bounding box surrounding the face
  annotations?: FaceAnnotations; // Special regions (eyes, nose, lips...)
}
```
**Feature**: Standard output from Face Landmark Module, all renderers and logic depend on this struct.

### `KEYPOINT_INDICES`
```typescript
export const KEYPOINT_INDICES = {
  LEFT_EYE: 130,      // Left eye point
  RIGHT_EYE: 359,     // Right eye point
  EYE_CENTER: 168,    // Point between 2 eyes (nose bridge)
  ...
}
```
**Feature**: Lookup table for important points in `scaledMesh`, used to calculate position of glasses, hat, etc.

---

## 2. Transform Types

### `ARTransform`
```typescript
export interface ARTransform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}
```
**Feature**: Calculation result from landmarks -> used to position 3D object in Three.js scene.

### `ARSettings`
```typescript
export interface ARSettings {
  scale: number;    // Scale up/down (0-200, default 100)
  offsetX: number;  // Horizontal offset (0-100, default 50 = center)
  offsetY: number;  // Vertical offset (0-100, default 50 = center)
  opacity: number;  // Transparency (0-100)
}
```
**Feature**: UI controls (sliders) will change these values -> pass to renderer each frame -> user can fine-tune glasses position in real-time.

---

## 3. Product Types

### `ARObjectType`
```typescript
export type ARObjectType = 'glasses' | 'hat' | 'lipstick' | 'mask' | 'earring';
```
**Feature**: Define product type -> engine will select appropriate renderer. Extend with new types when needed.

### `ARProduct`
```typescript
export interface ARProduct {
  id: string;
  type: ARObjectType;
  overlayUrl: string;      // 2D image URL (PNG)
  modelUrl?: string;       // 3D model URL (GLTF/GLB) - future
  anchorPoints?: AnchorConfig;
}
```
**Feature**: Describe product to try on. UI passes product -> engine loads texture/model and renders.

---

## 4. Engine Types

### `AREngineState`
```typescript
export interface AREngineState {
  isLoading: boolean;      // Loading AI model
  isDetecting: boolean;    // Running detection loop
  isModelLoaded: boolean;  // Model is ready
  error: string | null;    // Error if any
  faceDetected: boolean;   // Is face detected
  fps: number;             // Current FPS
}
```
**Feature**: UI subscribes to this state to display loading spinner, error message, FPS counter, etc.

### `AREngineConfig`
```typescript
export interface AREngineConfig {
  maxFaces: number;           // Max faces to detect (default: 1)
  shouldLoadIrisModel: boolean; // Load iris model (default: true)
  backend: 'webgl' | 'wasm' | 'cpu'; // TensorFlow backend
  targetFPS: number;          // Target FPS
}
```
**Feature**: Configuration for FaceLandmarkDetector, customizable based on device performance.

---

## 5. Renderer Interface

### `IARRenderer`
```typescript
export interface IARRenderer {
  init(canvas: HTMLCanvasElement): void;
  render(landmarks: FaceLandmarks, settings: ARSettings, videoSize: VideoSize): void;
  setProduct(product: ARProduct): Promise<void>;
  dispose(): void;
  getScene(): THREE.Scene | null;
  getCamera(): THREE.Camera | null;
}
```
**Feature**: Standard interface for all renderers. When adding new product types (hat, earring...), just create a class implementing this interface.

---

## 6. Hook Return Types

### `UseAREngineReturn`
```typescript
export interface UseAREngineReturn {
  state: AREngineState;                    // Current state
  start: (video, canvas) => Promise<void>; // Start AR
  stop: () => void;                        // Stop AR
  setProduct: (product) => void;           // Change product
  setSettings: (settings) => void;         // Update settings
  landmarks: FaceLandmarks | null;         // Current landmarks
}
```
**Feature**: Main interface that UI component uses. All AR operations go through here.

---

## Data Flow

```
UI Component
    │
    ├── useAREngine() ──────────────────────────────────┐
    │       │                                           │
    │       ├── state ← AREngineState                   │
    │       ├── landmarks ← FaceLandmarks               │
    │       │                                           │
    │       ├── start(video, canvas) ───────────────────┤
    │       │       │                                   │
    │       │       ├── FaceLandmarkDetector.load()     │
    │       │       ├── GlassesRenderer.init(canvas)    │
    │       │       └── detectionLoop() ────────────────┤
    │       │               │                           │
    │       │               ├── detect(video)           │
    │       │               │       └── FaceLandmarks   │
    │       │               │                           │
    │       │               └── render(landmarks, settings)
    │       │                                           │
    │       ├── setProduct(ARProduct) ──────────────────┤
    │       └── setSettings(ARSettings) ────────────────┘
    │
    └── UI Controls (sliders, buttons) → setSettings()
```

---

## Usage Example

```tsx
'use client';
import { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useAREngine } from '@/hooks/useAREngine';
import type { ARProduct } from '@/lib/ar';

const ARTryOnPage = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { state, start, stop, setProduct, setSettings, landmarks } = useAREngine();

  useEffect(() => {
    const product: ARProduct = {
      id: 'glasses-1',
      type: 'glasses',
      overlayUrl: '/products/glasses.png',
    };
    setProduct(product);
  }, [setProduct]);

  useEffect(() => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === 4) {
      start(video, canvas);
    }
    
    return () => stop();
  }, [start, stop]);

  return (
    <div style={{ position: 'relative' }}>
      {state.isLoading && <div>Loading...</div>}
      <Webcam ref={webcamRef} mirrored />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
};
```
