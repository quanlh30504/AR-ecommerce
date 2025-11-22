"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Camera, Settings, Palette, FlipHorizontal, X, Settings2 } from 'lucide-react';

const PRODUCTS = [
  { icon: "Glasses", overlay: "https://i.pinimg.com/736x/b1/cf/de/b1cfde97f444553395843d3cb7fd84d2.jpg" },
  { icon: "Lipstick", overlay: "https://i.pinimg.com/736x/e6/b9/c1/e6b9c1decfae8e63c78edf62d1328f3f.jpg" },
  { icon: "Hat", overlay: "https://i.pinimg.com/736x/16/87/8e/16878eb1d5ded1952ba961bcbb89a49e.jpg" },
  { icon: "Mustache", overlay: "https://i.pinimg.com/736x/b4/b4/86/b4b486fcb20bb3a2f855c44d3b688821.jpg" },
];


export default function Page() {
  const { id } = useParams() as { id?: string };
  const videoBackRef = useRef<HTMLVideoElement>(null);
  const videoFrontRef = useRef<HTMLVideoElement>(null);
  const arContainerRef = useRef<HTMLDivElement | null>(null);

  const [camerasReady, setCamerasReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frontCameraEnabled, setFrontCameraEnabled] = useState(true);
  const [swapLayout, setSwapLayout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Try-on state
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [tryOnEnabled, setTryOnEnabled] = useState(true);
  const [slidersOpen, setSlidersOpen] = useState(false);

  // Điều chỉnh overlay
  const [scale, setScale] = useState(50);
  const [offsetX, setOffsetX] = useState(50);
  const [offsetY, setOffsetY] = useState(50);
  const [opacity, setOpacity] = useState(100);

  const startCameras = async () => {
    try {
      setError(null);

      const [frontStream, backStream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        }),
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        }),
      ]);

      if (videoFrontRef.current && frontCameraEnabled) {
        videoFrontRef.current.srcObject = frontStream;
        await videoFrontRef.current.play();
      }

      if (videoBackRef.current) {
        videoBackRef.current.srcObject = backStream;
        await videoBackRef.current.play();
      }

      setCamerasReady(true);
    } catch (err: any) {
      let msg = "Không thể mở camera";
      if (err.name === "NotAllowedError") msg = "Bạn chưa cấp quyền camera";
      else if (err.name === "OverconstrainedError") msg = "Thiết bị không hỗ trợ mở đồng thời 2 camera";

      setError(msg);
    }
  };

  const stopStreams = () => {
    [videoFrontRef, videoBackRef].forEach(ref => {
      if (ref.current?.srcObject) {
        (ref.current.srcObject as MediaStream)
          .getTracks()
          .forEach(t => t.stop());
        ref.current.srcObject = null;
      }
    });
  };

  useEffect(() => {
    startCameras();
    return () => stopStreams();
  }, [frontCameraEnabled]);

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!arContainerRef.current) return;
      if (!arContainerRef.current.contains(target) && !(target instanceof Element && target.closest('.no-dismiss'))) {
        setShowSettings(false);
        setSlidersOpen(false);
      }
    };

    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [showSettings, slidersOpen]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Layout chính - 2 camera */}
      {/* Product list sidebar (left) */}
      <aside className="absolute right-6 bottom-0.5 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
        {PRODUCTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => { setSelectedProduct(idx); setTryOnEnabled(true); }}
            className={`w-16 h-16 rounded-xl overflow-hidden shadow-lg flex items-center justify-center transition-transform ${selectedProduct === idx ? 'ring-2 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
            title={p.icon}
          >
            <img src={p.overlay} alt={p.icon} className="w-full h-full object-cover" />
          </button>
        ))}
      </aside>
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Container chính - tự động điều chỉnh kích thước */}
        <div
          className={`
            relative w-full bg-black rounded-3xl overflow-hidden shadow-2xl
            transition-all duration-500 ease-out
            ${frontCameraEnabled
              ? "h-full max-w-5xl"
              : "h-[80vh] max-h-screen aspect-video"
            }
          `}
        >
          {/* Khi có 2 camera → chia đôi */}
          {frontCameraEnabled ? (
            <div className={`flex flex-col h-full ${swapLayout ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
              {/* Camera sau */}
              <div className="relative flex-1 px-0 md:px-1 lg:px-2 overflow-hidden rounded-2xl flex items-center justify-center">
                <div className="w-full h-full max-w-full max-h-full aspect-[1/1] md:aspect-video">
                  <video
                    ref={videoBackRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover brightness-[1.15] contrast-[1.1] block rounded-2xl"
                  />
                </div>
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-white">Main Camera</p>
                </div>
              </div>

              {/* Camera trước */}
              <div className="relative flex-1 px-0 md:px-1 lg:px-2 overflow-hidden rounded-2xl flex items-center justify-center">
                <div className="w-full h-full max-w-full max-h-full aspect-[1/1] md:aspect-video">
                  <video
                    ref={videoFrontRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover brightness-[1.2] scale-x-[-1] block rounded-2xl"
                  />
                </div>
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <p className="text-white">AR Cam</p>
                </div>
              </div>
            </div>
          ) : (
            /* Khi chỉ còn 1 camera → căn giữa, thu nhỏ đẹp */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <div className="w-full max-w-[70%] max-h-[90%] border-0 rounded-2xl overflow-hidden shadow-2xl">
                <video
                  ref={videoBackRef}
                  playsInline
                  muted
                  className="w-full h-full object-contain brightness-[1.15] contrast-[1.1] block rounded-2xl"
                />
              </div>
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-white">Main Camera</p>
              </div>

              {/* Nút bật lại camera trước khi đã tắt */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button
                  onClick={() => setFrontCameraEnabled(true)}
                  className="pointer-events-auto bg-white/20 backdrop-blur-lg px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-white/30 transition"
                >
                  <Camera className="w-6 h-6" />
                  <span className="font-medium text-lg text-white">Bật camera AR</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== THANH ĐIỀU KHIỂN DƯỚI (cập nhật nút Try-On) ==================== */}
      <div 
        ref={arContainerRef}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-xl px-6 py-4 rounded-full shadow-2xl z-10 no-dismiss">
        <button onClick={() => setSwapLayout(!swapLayout)} className="p-4 rounded-full hover:bg-white/20 transition">
          <FlipHorizontal className="w-6 h-6 text-white" />
        </button>

        <button onClick={() => setTryOnEnabled(!tryOnEnabled)} className={`p-4 rounded-full transition ${tryOnEnabled ? 'bg-indigo-500 ring-4 ring-indigo-500/30' : 'bg-white/20'}`}>
          <Palette className="w-6 h-6" />
        </button>

        <button onClick={() => setSlidersOpen(!slidersOpen)} className="p-4 rounded-full hover:bg-white/20 transition">
          <Settings2 className={`w-6 text-white h-6 transition-transform ${slidersOpen ? 'rotate-90' : ''}`} />
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-4 rounded-full hover:bg-white/20 transition relative"
        >
          <Settings className={`w-6 h-6 text-white transition-transform ${showSettings ? 'rotate-90' : ''}`} />
        </button>

        {/* Nút Record đỏ (giữ nguyên) */}
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-5 h-5 bg-white rounded-full"></div>
        </div>
      </div>

      {/* ==================== SLIDERS ĐIỀU CHỈNH TRY-ON (mở từ dưới lên) ==================== */}
      <div className={`absolute bottom-30 left-1/2 -translate-x-1/2 transition-all duration-300 ${slidersOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'} z-50 no-dismiss`}>
        <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-80 shadow-2xl">
          <h3 className="text-lg font-bold text-white text-center mb-5">Điều chỉnh thử đồ</h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs text-white/70">Kích cỡ ({scale}%)</label>
              <input type="range" min="20" max="150" value={scale} onChange={e => setScale(+e.target.value)} className="w-full h-2 bg-gray-700 rounded-full" />
            </div>
            <div>
              <label className="text-xs text-white/70">Trái ↔ Phải</label>
              <input type="range" min="0" max="100" value={offsetX} onChange={e => setOffsetX(+e.target.value)} className="w-full h-2 bg-gray-700 rounded-full" />
            </div>
            <div>
              <label className="text-xs text-white/70">Lên ↓ Xuống</label>
              <input type="range" min="0" max="100" value={offsetY} onChange={e => setOffsetY(+e.target.value)} className="w-full h-2 bg-gray-700 rounded-full" />
            </div>
            <div>
              <label className="text-xs text-white/70">Độ trong suốt ({opacity}%)</label>
              <input type="range" min="30" max="100" value={opacity} onChange={e => setOpacity(+e.target.value)} className="w-full h-2 bg-gray-700 rounded-full" />
            </div>
          </div>
        </div>
      </div>


      {/* Panel cài đặt trượt lên */}
      <div className={`absolute bottom-30 left-1/2 -translate-x-1/2 transition-all duration-300 ${showSettings ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-80 shadow-2xl no-dismiss">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Cài đặt hiển thị</h3>
            <button onClick={() => setShowSettings(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-white">Camera AR</span>
              <button
                onClick={() => setFrontCameraEnabled(!frontCameraEnabled)}
                className={`w-14 h-8 rounded-full transition ${frontCameraEnabled ? 'bg-purple-500' : 'bg-gray-600'} relative`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${frontCameraEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <button
              onClick={startCameras}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-2xl font-medium transition"
            >
              Làm mới camera
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {!camerasReady && !error && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Đang mở camera...</p>
          </div>
        </div>
      )}

      {/* Lỗi */}
      {error && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center max-w-sm px-8">
            <p className="text-red-400 text-lg mb-6">{error}</p>
            <button
              onClick={startCameras}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-2xl font-medium"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}