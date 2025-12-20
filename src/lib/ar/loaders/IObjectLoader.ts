import type * as THREE from 'three';
import type { ARTransform } from '../types';

export interface IObjectLoader {
  load(url: string): Promise<void>;
  applyTransform(transform: ARTransform, opacity: number): void;
  getObject(): THREE.Object3D | null;
  attachToScene(scene: THREE.Scene): void;
  dispose(): void;
  isLoaded(): boolean;
}
