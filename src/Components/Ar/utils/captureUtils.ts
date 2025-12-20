export function captureVideoWithCanvas(
  video: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null,
  mirror: boolean = true
): string | null {
  if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null;

  const outputCanvas = document.createElement('canvas');
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) return null;

  const width = video.videoWidth;
  const height = video.videoHeight;
  outputCanvas.width = width;
  outputCanvas.height = height;

  if (mirror) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, width, height);

  if (mirror) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  if (canvas && canvas.width > 0 && canvas.height > 0) {
    ctx.drawImage(canvas, 0, 0, width, height);
  }

  return outputCanvas.toDataURL('image/png');
}

export function captureVideoWithCanvasAsync(
  video: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null,
  mirror: boolean = true
): Promise<string | null> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve(captureVideoWithCanvas(video, canvas, mirror));
      });
    });
  });
}

function calculateObjectCoverCrop(
  videoWidth: number, videoHeight: number,
  containerWidth: number, containerHeight: number
): { sx: number; sy: number; sw: number; sh: number } {
  const videoAspect = videoWidth / videoHeight;
  const containerAspect = containerWidth / containerHeight;

  let sx = 0, sy = 0, sw = videoWidth, sh = videoHeight;

  if (videoAspect > containerAspect) {
    sw = videoHeight * containerAspect;
    sx = (videoWidth - sw) / 2;
  } else {
    sh = videoWidth / containerAspect;
    sy = (videoHeight - sh) / 2;
  }

  return { sx, sy, sw, sh };
}

export function captureDualCameras(
  videoI: HTMLVideoElement | null,
  canvasI: HTMLCanvasElement | null,
  videoII: HTMLVideoElement | null,
  canvasII: HTMLCanvasElement | null,
  mirror: boolean = true
): string | null {
  if (!videoI || !videoII) return null;
  if (videoI.videoWidth === 0 || videoII.videoWidth === 0) return null;

  const tempCanvasI = document.createElement('canvas');
  const ctxI = tempCanvasI.getContext('2d');
  const tempCanvasII = document.createElement('canvas');
  const ctxII = tempCanvasII.getContext('2d');
  
  if (!ctxI || !ctxII) return null;

  // Use displayed (CSS) size for output, matching what user sees with object-cover
  const displayWidthI = videoI.clientWidth || videoI.offsetWidth;
  const displayHeightI = videoI.clientHeight || videoI.offsetHeight;
  const displayWidthII = videoII.clientWidth || videoII.offsetWidth;
  const displayHeightII = videoII.clientHeight || videoII.offsetHeight;

  // Calculate crop region to match object-cover behavior
  const cropI = calculateObjectCoverCrop(videoI.videoWidth, videoI.videoHeight, displayWidthI, displayHeightI);
  const cropII = calculateObjectCoverCrop(videoII.videoWidth, videoII.videoHeight, displayWidthII, displayHeightII);

  // Use canvas AR size for output (matches displayed video after object-cover)
  const wI = canvasI?.width || displayWidthI;
  const hI = canvasI?.height || displayHeightI;
  const wII = canvasII?.width || displayWidthII;
  const hII = canvasII?.height || displayHeightII;

  tempCanvasI.width = wI;
  tempCanvasI.height = hI;
  tempCanvasII.width = wII;
  tempCanvasII.height = hII;

  // Draw video I with mirror - crop to match object-cover
  if (mirror) {
    ctxI.translate(wI, 0);
    ctxI.scale(-1, 1);
  }
  ctxI.drawImage(videoI, cropI.sx, cropI.sy, cropI.sw, cropI.sh, 0, 0, wI, hI);
  
  // Draw AR canvas I - already aligned with displayed video
  if (canvasI && canvasI.width > 0 && canvasI.height > 0) {
    ctxI.drawImage(canvasI, 0, 0, canvasI.width, canvasI.height);
  }
  ctxI.setTransform(1, 0, 0, 1, 0, 0);

  // Draw video II with mirror - crop to match object-cover
  if (mirror) {
    ctxII.translate(wII, 0);
    ctxII.scale(-1, 1);
  }
  ctxII.drawImage(videoII, cropII.sx, cropII.sy, cropII.sw, cropII.sh, 0, 0, wII, hII);
  
  // Draw AR canvas II - already aligned with displayed video
  if (canvasII && canvasII.width > 0 && canvasII.height > 0) {
    ctxII.drawImage(canvasII, 0, 0, canvasII.width, canvasII.height);
  }
  ctxII.setTransform(1, 0, 0, 1, 0, 0);

  const outputCanvas = document.createElement('canvas');
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) return null;

  const finalWidth = wI + wII;
  const finalHeight = Math.max(hI, hII);
  outputCanvas.width = finalWidth;
  outputCanvas.height = finalHeight;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, finalWidth, finalHeight);

  const offsetYI = (finalHeight - hI) / 2;
  const offsetYII = (finalHeight - hII) / 2;

  ctx.drawImage(tempCanvasI, 0, offsetYI);
  ctx.drawImage(tempCanvasII, wI, offsetYII);

  return outputCanvas.toDataURL('image/png');
}

export function captureDualCamerasAsync(
  videoI: HTMLVideoElement | null,
  canvasI: HTMLCanvasElement | null,
  videoII: HTMLVideoElement | null,
  canvasII: HTMLCanvasElement | null,
  mirror: boolean = true
): Promise<string | null> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve(captureDualCameras(videoI, canvasI, videoII, canvasII, mirror));
      });
    });
  });
}

export function downloadImage(dataUrl: string) {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `ar-tryon-${timestamp}.png`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
