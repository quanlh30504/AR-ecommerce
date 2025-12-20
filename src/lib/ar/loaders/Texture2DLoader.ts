import * as THREE from 'three';
import type { IObjectLoader } from './IObjectLoader';
import type { ARTransform } from '../types';

export class Texture2DLoader implements IObjectLoader {
  private textureLoader: THREE.TextureLoader;
  private mesh: THREE.Mesh | null = null;
  private loaded = false;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

  async load(url: string): Promise<void> {
    this.dispose();

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;

          const aspectRatio = texture.image.width / texture.image.height;
          const geometry = new THREE.PlaneGeometry(2 * aspectRatio, 2);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
          });

          this.mesh = new THREE.Mesh(geometry, material);
          this.loaded = true;
          resolve();
        },
        undefined,
        (error) => {
          console.error('Texture2DLoader: Failed to load texture', error);
          reject(new Error('Failed to load 2D texture'));
        }
      );
    });
  }

  applyTransform(transform: ARTransform, opacity: number): void {
    if (!this.mesh) return;

    this.mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
    this.mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
    this.mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);

    const material = this.mesh.material as THREE.MeshBasicMaterial;
    material.opacity = opacity / 100;
  }

  getObject(): THREE.Object3D | null {
    return this.mesh;
  }

  attachToScene(scene: THREE.Scene): void {
    if (!scene) {
      console.error('Texture2DLoader: Cannot attach to null scene');
      return;
    }
    
    if (this.mesh && !this.mesh.parent) {
      scene.add(this.mesh);
    }
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  dispose(): void {
    if (this.mesh) {
      if (this.mesh.parent) {
        this.mesh.parent.remove(this.mesh);
      }
      this.mesh.geometry.dispose();
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose();
      }
      this.mesh = null;
    }
    this.loaded = false;
  }
}
