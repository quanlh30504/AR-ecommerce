import { FaceLandmarkDetector } from './FaceLandmarkDetector';
import type { AREngineConfig } from '../types';

class DetectorManager {
  private static instance: FaceLandmarkDetector | null = null;
  private static refCount: number = 0;
  private static loadingPromise: Promise<void> | null = null;
  private static isPreloaded: boolean = false;

  static async preload(config?: Partial<AREngineConfig>): Promise<void> {
    if (this.isPreloaded || this.instance?.isReady()) {
      return;
    }

    if (!this.instance) {
      this.instance = new FaceLandmarkDetector(config);
    }

    if (!this.loadingPromise) {
      this.loadingPromise = this.instance.load().then(() => {
        this.isPreloaded = true;
      }).finally(() => {
        this.loadingPromise = null;
      });
    }

    await this.loadingPromise;
  }

  static isModelPreloaded(): boolean {
    return this.isPreloaded || (this.instance?.isReady() ?? false);
  }

  static async getInstance(config?: Partial<AREngineConfig>): Promise<FaceLandmarkDetector> {
    if (!this.instance) {
      this.instance = new FaceLandmarkDetector(config);
    }

    if (!this.instance.isReady()) {
      if (!this.loadingPromise) {
        this.loadingPromise = this.instance.load().then(() => {
          this.isPreloaded = true;
        }).finally(() => {
          this.loadingPromise = null;
        });
      }
      await this.loadingPromise;
    }

    this.refCount++;
    return this.instance;
  }

  static release(): void {
    this.refCount--;
    
    if (this.refCount <= 0) {
      this.refCount = 0;
      if (this.instance) {
        this.instance.dispose();
        this.instance = null;
      }
      this.loadingPromise = null;
    }
  }

  static getRefCount(): number {
    return this.refCount;
  }
}

export { DetectorManager };
