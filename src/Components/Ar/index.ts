export { default as ARFacePage } from './face';

export { useCameraManager } from './hooks/useCameraManager';
export { useProductManager } from './hooks/useProductManager';
export { useARControls } from './hooks/useARControls';

export { CameraView } from './components/CameraView';
export { ProductSelector } from './components/ProductSelector';
export { ControlPanel } from './components/ControlPanel';
export { ARSettingsSliders } from './components/ARSettingsSliders';
export { SettingsPanel } from './components/SettingsPanel';
export { LoadingScreen, ErrorScreen } from './components/LoadingAndError';
export { DualCameraView } from './components/DualCameraView';
export { SingleCameraView } from './components/SingleCameraView';

export type {
  Product,
  CameraState,
  ARControlState,
  UIState,
  ARSettings,
} from './types';
