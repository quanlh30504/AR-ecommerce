"use client";
// ...existing code...
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams() as { id?: string };
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let model: any = null;
    let stopped = false;

    const init = async () => {
      console.log("[AR] init start", { id });
      try {
        const modBlaze = await import("@tensorflow-models/blazeface").catch((e) => {
          console.error("[AR] import blazeface failed", e);
          return null;
        });
        if (!modBlaze) throw new Error("Import of @tensorflow-models/blazeface failed");

        // handle both `export default` and direct export
        const blazeface = (modBlaze as any).default ?? modBlaze;
        if (!blazeface || typeof blazeface.load !== "function") {
          console.error("[AR] blazeface module shape:", Object.keys(modBlaze));
          throw new Error("blazeface.load is not available on imported module");
        }

        const tf = await import("@tensorflow/tfjs").catch((e) => {
          console.error("[AR] import tfjs failed", e);
          return null;
        });
        if (!tf) throw new Error("Import of @tensorflow/tfjs failed");

        console.log("[AR] imports OK — attempting backend ready");

        // optional: try to set backend (cpu fallback is safe for debugging)
        try {
          await import("@tensorflow/tfjs-backend-cpu").catch(() => {});
          await tf.setBackend?.("cpu");
          await tf.ready?.();
          console.log("[AR] tf backend ready (cpu)");
        } catch (e) {
          console.warn("[AR] backend init warning", e);
        }

        if (stopped) return;

        const video = videoRef.current!;
        if (!video) throw new Error("Video element missing");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        video.srcObject = stream;
        await video.play();

        const canvas = canvasRef.current!;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        model = await blazeface.load();
        if (!model) throw new Error("Model.load returned falsy");
        console.log("[AR] blazeface model loaded");

        setLoading(false);

        const loop = async () => {
          if (!model || stopped) return;
          try {
            const preds = await model.estimateFaces(video, false, false);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const p of preds) {
              const start = p.topLeft;
              const end = p.bottomRight;
              const w = end[0] - start[0];
              const h = end[1] - start[1];
              ctx.strokeStyle = "red";
              ctx.lineWidth = 2;
              ctx.strokeRect(start[0], start[1], w, h);
            }
          } catch (e) {
            console.error("[AR] loop error", e);
            setError(String(e));
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (err: any) {
        console.error("[AR] init failed", err);
        setError(err?.message || String(err));
        setLoading(false);
      }
    };

    init();

    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const v = videoRef.current;
      if (v && v.srcObject) {
        (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        v.srcObject = null;
      }
    };
  }, [id]);

  return (
    <div className="p-4 bg-white rounded-md shadow-md flex items-center justify-center flex-auto">
      {/* <h2 className="mb-2 text-lg">Trải nghiệm AR — product id: {id}</h2> */}
      {loading && <div className="text-sm text-gray-500">Đang tải mô hình...</div>}
      {error && (
        <div className="text-sm text-red-600">
          Lỗi: {error}. Mở DevTools → Console/Network để xem import/.wasm requests.
        </div>
      )}
      <div className="relative">
        <video ref={videoRef} playsInline muted className="rounded-md" style={{ maxWidth: "100%" }} />
        <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-none rounded-md" />
      </div>
    </div>
  );
}
// ...existing code...