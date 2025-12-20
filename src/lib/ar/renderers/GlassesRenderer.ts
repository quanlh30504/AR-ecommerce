import * as THREE from 'three';
import { BaseRenderer } from './BaseRenderer';
import type { FaceLandmarks, ARSettings, ARProduct, VideoSize, ARTransform } from '../types';
import { KEYPOINT_INDICES, DEFAULT_AR_SETTINGS } from '../types';

export class GlassesRenderer extends BaseRenderer {
  private glassesMesh: THREE.Mesh | null = null;
  private textureLoader: THREE.TextureLoader | null = null;

  protected onInit(): void {
    this.textureLoader = new THREE.TextureLoader();
  }

  async setProduct(product: ARProduct): Promise<void> {
    if (!this.scene || !this.textureLoader) {
      throw new Error('GlassesRenderer: Not initialized. Call init() first.');
    }

    if (this.glassesMesh) {
      this.scene.remove(this.glassesMesh);
      this.glassesMesh.geometry.dispose();
      if (this.glassesMesh.material instanceof THREE.Material) {
        this.glassesMesh.material.dispose();
      }
      this.glassesMesh = null;
    }

    return new Promise((resolve, reject) => {
      this.textureLoader!.load(
        product.overlayUrl,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;

          const aspectRatio = texture.image.width / texture.image.height;
          const geometry = new THREE.PlaneGeometry(2 * aspectRatio, 2);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
          });

          this.glassesMesh = new THREE.Mesh(geometry, material);
          this.scene!.add(this.glassesMesh);
          this.currentProduct = product;

          resolve();
        },
        undefined,
        (error) => {
          console.error('GlassesRenderer: Failed to load texture', error);
          reject(new Error('Failed to load glasses texture'));
        }
      );
    });
  }

  render(landmarks: FaceLandmarks, settings: ARSettings, videoSize: VideoSize): void {
    if (!this.glassesMesh || !landmarks.scaledMesh) {
      this.clearScene();
      this.renderScene();
      return;
    }

    const transform = this.calculateTransform(landmarks, settings, videoSize);
    this.applyTransform(transform, settings);
    this.renderScene();
  }

  private calculateTransform(
    landmarks: FaceLandmarks,
    settings: ARSettings,
    videoSize: VideoSize
  ): ARTransform {
    const mesh = landmarks.scaledMesh;

    const leftEye = mesh[KEYPOINT_INDICES.LEFT_EYE];
    const rightEye = mesh[KEYPOINT_INDICES.RIGHT_EYE];
    const eyeCenter = mesh[KEYPOINT_INDICES.EYE_CENTER];

    const eyeDistance = Math.sqrt(
      Math.pow(rightEye[0] - leftEye[0], 2) + Math.pow(rightEye[1] - leftEye[1], 2)
    );

    const baseScale = eyeDistance / 140;
    const userScale = settings.scale / DEFAULT_AR_SETTINGS.scale;
    const finalScale = baseScale * userScale;

    const offsetX = ((settings.offsetX - 50) / 50) * 0.5;
    const offsetY = ((settings.offsetY - 50) / 50) * 0.5;

    const posX = (eyeCenter[0] - videoSize.width / 2) * -0.01 + offsetX;
    const posY = (eyeCenter[1] - videoSize.height / 2) * -0.01 + offsetY;
    const posZ = 1;

    const eyeLine = new THREE.Vector2(rightEye[0] - leftEye[0], rightEye[1] - leftEye[1]);
    const rotationZ = Math.atan2(eyeLine.y, eyeLine.x);

    return {
      position: { x: posX, y: posY, z: posZ },
      rotation: { x: 0, y: 0, z: rotationZ },
      scale: { x: finalScale, y: finalScale, z: finalScale },
    };
  }

  private applyTransform(transform: ARTransform, settings: ARSettings): void {
    if (!this.glassesMesh) return;

    this.glassesMesh.position.set(transform.position.x, transform.position.y, transform.position.z);
    this.glassesMesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
    this.glassesMesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);

    const material = this.glassesMesh.material as THREE.MeshBasicMaterial;
    material.opacity = settings.opacity / 100;
  }

  protected onDispose(): void {
    if (this.glassesMesh) {
      this.glassesMesh.geometry.dispose();
      if (this.glassesMesh.material instanceof THREE.Material) {
        this.glassesMesh.material.dispose();
      }
      this.glassesMesh = null;
    }
    this.textureLoader = null;
  }
}
