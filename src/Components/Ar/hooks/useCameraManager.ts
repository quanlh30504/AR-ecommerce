import { useRef, useState, useEffect, useCallback } from 'react';


export function useCameraManager(cameraIIEnabled: boolean) {
  const videoIIRef = useRef<HTMLVideoElement>(null);
  const videoIRef = useRef<HTMLVideoElement>(null);
  
  const [camerasReady, setCamerasReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCameras = useCallback(async () => {
    try {
      const constraints = [
        {
          video: { facingMode: "user" },
          audio: false
        },
        {
          video: { facingMode: "environment" },
          audio: false
        },
      ];

      const [IIStream, IStream] = await Promise.all([
        navigator.mediaDevices.getUserMedia(constraints[0]),
        navigator.mediaDevices.getUserMedia(constraints[1]),
      ]);

      if (videoIIRef.current && cameraIIEnabled) {
        videoIIRef.current.srcObject = IIStream;
        videoIIRef.current.onloadedmetadata = async () => {
          await videoIIRef.current?.play();
        };
      }

      if (videoIRef.current) {
        videoIRef.current.srcObject = IStream;
        videoIRef.current.onloadedmetadata = async () => {
          await videoIRef.current?.play();
        };
      }

      setCamerasReady(true);
      setError(null);
    } catch (err: unknown) {
      let msg = "Không thể mở camera";
      const error = err as Error & { name?: string };
      if (error.name === "NotAllowedError") {
        msg = "Bạn chưa cấp quyền camera";
      } else if (error.name === "OverconstrainedError") {
        msg = "Thiết bị không hỗ trợ mở đồng thời 2 camera";
      }
      setError(msg);
    }
  }, [cameraIIEnabled]);

  const stopStreams = useCallback(() => {
    console.log("Stopping streams...");
    [videoIIRef, videoIRef].forEach(ref => {
      if (ref.current?.srcObject) {
        (ref.current.srcObject as MediaStream)
          .getTracks()
          .forEach(t => t.stop());
        ref.current.srcObject = null;
      }
    });
    setCamerasReady(false);
  }, []);

  useEffect(() => {
    startCameras();
    return () => stopStreams();
  }, [cameraIIEnabled, startCameras, stopStreams]);

  return {
    videoIRef,
    videoIIRef,
    camerasReady,
    error,
    startCameras,
    stopStreams,
  };
}
