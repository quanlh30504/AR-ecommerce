import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { IObjectLoader } from './IObjectLoader';
import type { ARTransform } from '../types';

export class Model3DLoader implements IObjectLoader {
  private gltfLoader: GLTFLoader;
  private model: THREE.Group | null = null;
  private loaded = false;

  constructor() {
    this.gltfLoader = new GLTFLoader();
  }

  async load(url: string): Promise<void> {
    this.dispose();

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          this.model = gltf.scene;
          this.loaded = true;
          resolve();
        },
        undefined,
        (error) => {
          console.error('Model3DLoader: Failed to load model', error);
          reject(new Error('Failed to load 3D model'));
        }
      );
    });
  }

  applyTransform(transform: ARTransform, opacity: number): void {
    if (!this.model) return;

    this.model.position.set(transform.position.x, transform.position.y, transform.position.z);
    this.model.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
    this.model.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshStandardMaterial;
        if (material.transparent !== undefined) {
          material.transparent = true;
          material.opacity = opacity / 100;
        }
      }
    });
  }

  getObject(): THREE.Object3D | null {
    return this.model;
  }

  attachToScene(scene: THREE.Scene): void {
    if (!scene) {
      console.error('Model3DLoader: Cannot attach to null scene');
      return;
    }
    
    if (this.model && !this.model.parent) {
      this.setupLighting(scene);
      scene.add(this.model);
    }
  }

  private setupLighting(scene: THREE.Scene): void {
    if (!scene || !scene.children) {
      console.error('Model3DLoader: Invalid scene for lighting setup');
      return;
    }

    const hasLights = scene.children.some(
      (child) => child instanceof THREE.Light
    );

    if (!hasLights) {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 2);
      scene.add(directionalLight);
    }
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  dispose(): void {
    if (this.model) {
      if (this.model.parent) {
        this.model.parent.remove(this.model);
      }
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          } else if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          }
        }
      });
      this.model = null;
    }
    this.loaded = false;
  }
}
