import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import type { FaceLandmarks, AREngineConfig } from '../types';

type MediaPipeFaceMesh = Awaited<ReturnType<typeof faceLandmarksDetection.load>>;

export class FaceLandmarkDetector {
  private model: MediaPipeFaceMesh | null = null;
  private config: AREngineConfig;
  private isInitialized = false;

  constructor(config: Partial<AREngineConfig> = {}) {
    this.config = {
      maxFaces: config.maxFaces ?? 1,
      shouldLoadIrisModel: config.shouldLoadIrisModel ?? true,
      backend: config.backend ?? 'webgl',
      targetFPS: config.targetFPS ?? 30,
    };
  }

  async load(): Promise<void> {
    if (this.isInitialized && this.model) {
      return;
    }

    try {
      await tf.setBackend(this.config.backend);
      await tf.ready();

      this.model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
        {
          shouldLoadIrisModel: this.config.shouldLoadIrisModel,
          maxFaces: this.config.maxFaces,
        }
      );

      this.isInitialized = true;
    } catch (error) {
      console.error('FaceLandmarkDetector: Failed to load model', error);
      throw new Error(`Failed to load face detection model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async detect(video: HTMLVideoElement): Promise<FaceLandmarks | null> {
    if (!this.model) {
      throw new Error('FaceLandmarkDetector: Model not loaded. Call load() first.');
    }

    if (video.readyState !== 4) {
      return null;
    }

    try {
      const faces = await this.model.estimateFaces({ input: video });

      if (faces.length === 0) {
        return null;
      }

      const face = faces[0];
      const scaledMesh = face.scaledMesh as number[][];

      const xCoords = scaledMesh.map((point) => point[0]);
      const yCoords = scaledMesh.map((point) => point[1]);

      return {
        scaledMesh,
        boundingBox: {
          topLeft: [Math.min(...xCoords), Math.min(...yCoords)],
          bottomRight: [Math.max(...xCoords), Math.max(...yCoords)],
        },
      };
    } catch (error) {
      console.error('FaceLandmarkDetector: Detection error', error);
      return null;
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.model !== null;
  }

  dispose(): void {
    this.model = null;
    this.isInitialized = false;
  }
}
