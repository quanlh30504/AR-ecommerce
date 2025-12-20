import { BaseRenderer } from './BaseRenderer';
import type { IObjectLoader } from '../loaders/IObjectLoader';
import type { ITransformCalculator } from '../transforms/ITransformCalculator';
import type { FaceLandmarks, ARSettings, ARProduct, VideoSize } from '../types';

export class CompositeRenderer extends BaseRenderer {
  private loader: IObjectLoader;
  private transformCalculator: ITransformCalculator;

  constructor(loader: IObjectLoader, transformCalculator: ITransformCalculator) {
    super();
    this.loader = loader;
    this.transformCalculator = transformCalculator;
  }

  protected onInit(): void {
    // no additional init needed, loader and transform are injected
  }

  async setProduct(product: ARProduct): Promise<void> {
    if (!this.scene) {
      throw new Error('CompositeRenderer: Not initialized. Call init() first.');
    }

    const url = product.modelUrl || product.overlayUrl;
    if (!url) {
      throw new Error('CompositeRenderer: Product must have overlayUrl or modelUrl.');
    }

    try {
      await this.loader.load(url);
      
      if (!this.scene) {
        throw new Error('CompositeRenderer: Scene was disposed during loading.');
      }
      
      this.loader.attachToScene(this.scene);
      this.currentProduct = product;
    } catch (error) {
      console.error('CompositeRenderer: Error setting product:', error);
      throw error;
    }
  }

  render(landmarks: FaceLandmarks, settings: ARSettings, videoSize: VideoSize): void {
    if (!this.loader.isLoaded() || !landmarks.scaledMesh) {
      this.clearScene();
      this.renderScene();
      return;
    }

    const transform = this.transformCalculator.calculate(
      landmarks,
      settings,
      videoSize,
      this.currentProduct ?? undefined
    );
    this.loader.applyTransform(transform, settings.opacity);
    this.renderScene();
  }

  protected onDispose(): void {
    this.loader.dispose();
  }
}
