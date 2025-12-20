src/lib/ar/
├── index.ts                    # Public exports
├── types.ts                    # All TypeScript interfaces
├── ProductRegistry.ts          # Registry + Factory pattern
│
├── core/
│   └── FaceLandmarkDetector.ts # Face detection
│
├── loaders/
│   ├── index.ts
│   ├── IObjectLoader.ts        # Loader interface
│   ├── Texture2DLoader.ts      # 2D PNG loader
│   └── Model3DLoader.ts        # 3D GLTF loader
│
├── transforms/
│   ├── index.ts
│   ├── ITransformCalculator.ts # Transform interface
│   └── GlassesTransform.ts     # Glasses positioning
│
└── renderers/
    ├── BaseRenderer.ts         # Abstract base
    └── CompositeRenderer.ts    # Combines loader + transform


---
3 layers:

┌─────────────────────────────────────────────────────────┐
│                    useAREngine                          │
│         (không quan tâm về loại sản phẩm cụ thể)        │  Hook cung cấp interface
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                RendererFactory                          │
│     (nhận product → trả về IARRenderer phù hợp)         │  Kết hợp Loader + Calculator
└─────────────────────┬───────────────────────────────────┘ 
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  ObjectLoader   │     │ TransformCalc   │                 
│  (2D/3D asset)  │     │ (glasses/hat..) │
└─────────────────┘     └─────────────────┘
Chỉ lo việc load và     Chỉ lo việc tính position/rotation/scale
 hiển thị asset         từ landmarks

---
### custom hook :
#### Input (Config)
```typescript
const { ... } = useAREngine(config?: Partial<AREngineConfig>);

interface AREngineConfig {
  maxFaces: number;              // default: 1
  shouldLoadIrisModel: boolean;  // default: true
  backend: 'webgl' | 'wasm' | 'cpu';  // default: 'webgl'
  targetFPS: number;             // default: 30
}
```
#### Output
| Property | Type | Mô tả |
|----------|------|-------|
| state | AREngineState | Trạng thái hiện tại của engine |
| start | (video, canvas) => Promise<void> | Khởi động AR |
| stop | () => void | Dừng AR |
| setProduct | (product: ARProduct) => void | Đổi sản phẩm thử |
| setSettings | (settings: Partial<ARSettings>) => void | Điều chỉnh scale/offset/opacity |
| landmarks | FaceLandmarks \| null | Dữ liệu landmark hiện tại |

State Object
```typescript
interface AREngineState {
  isLoading: boolean;      // Đang load model AI
  isDetecting: boolean;    // Đang chạy detection loop
  isModelLoaded: boolean;  // Model AI đã sẵn sàng
  error: string | null;    // Lỗi nếu có
  faceDetected: boolean;   // Có phát hiện khuôn mặt
  fps: number;             // FPS hiện tại
}
```

Product Object
```typescript
interface ARProduct {
  id: string;
  type: 'glasses' | 'hat' | 'lipstick' | 'mask' | 'earring';
  overlayUrl: string;      // URL ảnh 2D (PNG)
  modelUrl?: string;       // URL model 3D (GLTF/GLB) - optional
}
```

Settings Object
```typescript
interface ARSettings {
  scale: number;     // 0-200, default 100
  offsetX: number;   // 0-100, default 50 (center)
  offsetY: number;   // 0-100, default 50 (center)
  opacity: number;   // 0-100, default 100
}
```
