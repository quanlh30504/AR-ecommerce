import * as THREE from 'three';
import type { ITransformCalculator } from './ITransformCalculator';
import type { FaceLandmarks, ARSettings, ARTransform, VideoSize, ARProduct } from '../types';
import { KEYPOINT_INDICES, DEFAULT_AR_SETTINGS } from '../types';

export class HatTransform implements ITransformCalculator {
  private readonly DEFAULT_EYE_DISTANCE_DIVISOR = 300;

  calculate(
    landmarks: FaceLandmarks,
    settings: ARSettings,
    videoSize: VideoSize,
    product?: ARProduct
  ): ARTransform {
    const mesh = landmarks.scaledMesh;

    const leftEye = mesh[KEYPOINT_INDICES.LEFT_EYE];
    const rightEye = mesh[KEYPOINT_INDICES.RIGHT_EYE];
    const forehead = mesh[KEYPOINT_INDICES.FOREHEAD];
    const leftEar = mesh[KEYPOINT_INDICES.LEFT_EAR];
    const rightEar = mesh[KEYPOINT_INDICES.RIGHT_EAR];
    const noseTip = mesh[KEYPOINT_INDICES.NOSE_TIP];
    const chin = mesh[KEYPOINT_INDICES.CHIN];

    const eyeDistance = Math.sqrt(
      Math.pow(rightEye[0] - leftEye[0], 2) + Math.pow(rightEye[1] - leftEye[1], 2)
    );

    const divisor = product?.metadata?.eyeDistanceDivisor ?? this.DEFAULT_EYE_DISTANCE_DIVISOR;
    const baseScale = eyeDistance / divisor;
    const userScale = settings.scale / DEFAULT_AR_SETTINGS.scale;
    const finalScale = baseScale * userScale;

    const offsetX = ((settings.offsetX - 50) / 50) * 0.5;
    const offsetY = ((settings.offsetY - 50) / 50) * 0.5;

    const initAdjustPos = product?.initAdjustPosition || product?.metadata?.initAdjustPosition || { x: 0, y: 0, z: 0 };
    const initAdjustRot = product?.initAdjustRotation || product?.metadata?.initAdjustRotation || { x: 0, y: 0, z: 0 };

    const posX = (forehead[0] - videoSize.width / 2) * -0.01 + offsetX + initAdjustPos.x;
    const posY = (forehead[1] - videoSize.height / 2) * -0.01 + offsetY + initAdjustPos.y;
    const posZ = 1 + initAdjustPos.z;

    const eyeLine = new THREE.Vector2(rightEye[0] - leftEye[0], rightEye[1] - leftEye[1]);
    const rotationZ = Math.atan2(eyeLine.y, eyeLine.x);

    const faceHeight = Math.sqrt(
      Math.pow(chin[0] - forehead[0], 2) +
      Math.pow(chin[1] - forehead[1], 2) +
      Math.pow(chin[2] - forehead[2], 2)
    );
    const noseDrop = noseTip[2] - forehead[2];
    const rotationX = Math.atan2(noseDrop, faceHeight * 0.3);

    const leftEyeToNose = Math.sqrt(
      Math.pow(noseTip[0] - leftEye[0], 2) + Math.pow(noseTip[2] - leftEye[2], 2)
    );
    const rightEyeToNose = Math.sqrt(
      Math.pow(noseTip[0] - rightEye[0], 2) + Math.pow(noseTip[2] - rightEye[2], 2)
    );
    const asymmetry = (leftEyeToNose - rightEyeToNose) / eyeDistance;
    const rotationY = Math.asin(Math.max(-1, Math.min(1, asymmetry))) * 2;

    return {
      position: { x: posX, y: posY, z: posZ },
      rotation: { 
        x: 0 + initAdjustRot.x, 
        y: -rotationY + initAdjustRot.y, 
        z: rotationZ + initAdjustRot.z 
      },
      scale: { x: finalScale, y: finalScale, z: finalScale },
    };
  }
}
