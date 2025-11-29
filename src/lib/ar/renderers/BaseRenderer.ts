import * as THREE from 'three';
import type { FaceLandmarks, ARSettings, ARProduct, IARRenderer, VideoSize } from '../types';

export abstract class BaseRenderer implements IARRenderer {
  protected scene: THREE.Scene | null = null;
  protected camera: THREE.PerspectiveCamera | null = null;
  protected renderer: THREE.WebGLRenderer | null = null;
  protected canvas: HTMLCanvasElement | null = null;
  protected currentProduct: ARProduct | null = null;
  protected isInitialized = false;

  init(canvas: HTMLCanvasElement): void {
    if (this.isInitialized) {
      return;
    }

    this.canvas = canvas;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.onInit();
    this.isInitialized = true;
  }

  abstract render(landmarks: FaceLandmarks, settings: ARSettings, videoSize: VideoSize): void;
  abstract setProduct(product: ARProduct): Promise<void>;

  protected abstract onInit(): void;
  protected abstract onDispose(): void;

  protected renderScene(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  protected clearScene(): void {
    if (this.renderer) {
      this.renderer.clear();
    }
  }

  getScene(): THREE.Scene | null {
    return this.scene;
  }

  getCamera(): THREE.Camera | null {
    return this.camera;
  }

  resize(width: number, height: number): void {
    if (this.camera && this.renderer) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  dispose(): void {
    this.onDispose();

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    if (this.scene) {
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          }
        }
      });
      this.scene.clear();
      this.scene = null;
    }

    this.camera = null;
    this.canvas = null;
    this.currentProduct = null;
    this.isInitialized = false;
  }
}
