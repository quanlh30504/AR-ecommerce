import type { FaceLandmarks, ARSettings, ARTransform, VideoSize, ARProduct } from '../types';

export interface ITransformCalculator {
  calculate(
    landmarks: FaceLandmarks,
    settings: ARSettings,
    videoSize: VideoSize,
    product?: ARProduct
  ): ARTransform;
}
