"use client";
import React, { useEffect, useRef, useState, } from "react";
import { useParams, useRouter } from "next/navigation";
import { Settings, Palette, FlipHorizontal, X, Settings2, RectangleGoggles, Layers2 } from 'lucide-react';
import { Button } from "../ui/button";

const PRODUCTS = [
  { icon: "Glasses", overlay: "https://i.pinimg.com/736x/b1/cf/de/b1cfde97f444553395843d3cb7fd84d2.jpg" },
  { icon: "Lipstick", overlay: "https://i.pinimg.com/736x/e6/b9/c1/e6b9c1decfae8e63c78edf62d1328f3f.jpg" },
  { icon: "Hat", overlay: "https://i.pinimg.com/736x/16/87/8e/16878eb1d5ded1952ba961bcbb89a49e.jpg" },
  { icon: "Mustache", overlay: "https://i.pinimg.com/736x/b4/b4/86/b4b486fcb20bb3a2f855c44d3b688821.jpg" },
];


export default function Page() {
  const router = useRouter();
  const { id } = useParams() as { id?: string };
  const videoIIRef = useRef<HTMLVideoElement>(null);
  const videoIRef = useRef<HTMLVideoElement>(null);
  const arContainerRef = useRef<HTMLDivElement | null>(null);

  const [camerasReady, setCamerasReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [CameraIIEnabled, setCameraIIEnabled] = useState(false);
  const [swapLayout, setSwapLayout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Try-on state
  const [selectedProductI, setSelectedProductI] = useState<number | null>(null);
  const [selectedProductII, setSelectedProductII] = useState<number | null>(null);
  const [arEnabledI, setArEnabledI] = useState(true); // Cho Camera I RIGHT
  const [arEnabledII, setArEnabledII] = useState(true); // Cho Camera II LEFT
  const [tryOnEnabled, setTryOnEnabled] = useState(true);
  const [slidersOpen, setSlidersOpen] = useState(false);

  // Điều chỉnh overlay
  const [scale, setScale] = useState(50);
  const [offsetX, setOffsetX] = useState(50);
  const [offsetY, setOffsetY] = useState(50);
  const [opacity, setOpacity] = useState(100);

  const handleBackButton = () => {
    alert("Thực hiện hành động Quay lại/Thoát AR");
    router.back();
    stopStreams();
  }

  const startCameras = async () => {
    try {
      const [IIStream, IStream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        }),
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        }),
      ]);

      if (videoIIRef.current && CameraIIEnabled) {
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
    } catch (err: any) {
      // console.log("Error accessing cameras:", err);
      let msg = "Không thể mở camera";
      if (err.name === "NotAllowedError") msg = "Bạn chưa cấp quyền camera";
      else if (err.name === "OverconstrainedError") msg = "Thiết bị không hỗ trợ mở đồng thời 2 camera";
      setError(msg);
    }
  };

  const stopStreams = () => {
    console.log("Stopping streams...");
    [videoIIRef, videoIRef].forEach(ref => {
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
  }, [CameraIIEnabled]);

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

  useEffect(() => {
    const handleUnload = () => stopStreams();
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return (
    <>
      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* Layout chính - 2 camera */}
        <Button
          onClick={() => handleBackButton()}
          title="Exit AR"
          className={`absolute size-12 top-6 left-6 p-4 rounded-full transition z-20 bg-indigo-500/80 ring-indigo-500/40} hover:bg-indigo-700 shadow-2xl`}
        >
          <X className="size-6 text-white" />
        </Button>
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div
            className={`
             w-full bg-black h-full rounded-3xl overflow-hidden shadow-2xl
            transition-all duration-500 ease-out
            ${CameraIIEnabled
                ? "h-full max-w-5xl"
                : "h-[80vh] max-h-screen aspect-video"
              }
          `}
          >
            {/* Khi có 2 camera → chia đôi */}
            {CameraIIEnabled ? (
              <>
                <div className={`absolute top-25 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${swapLayout ? 'right-3' : 'left-0'}`}>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <p className="text-white">Model I</p>
                </div>

                {/* Product List cho Model II */}
                <aside className={`absolute bottom-0.5 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3 ${swapLayout ? 'right-6' : 'left-6'}`}>
                  {PRODUCTS.map((p, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      onClick={() => { setSelectedProductI(idx); setTryOnEnabled(true); }}
                      className={`w-16 h-16 p-0 rounded-xl overflow-hidden shadow-lg flex items-center justify-center transition-transform ${selectedProductI === idx ? 'ring-4 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
                      title={p.icon}
                    >
                      <img src={p.overlay} alt={p.icon} className="w-full h-full object-cover block" />
                    </Button>
                  ))}
                </aside>

                {/* Tag cho Model I (Camera Sau) */}
                <div className={`absolute top-25 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${swapLayout ? 'left-0' : 'right-3'}`}>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-white">Model II</p>
                </div>

                {/* Product List cho Model I */}
                <aside className={`absolute bottom-0.5 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3 ${swapLayout ? 'left-6' : 'right-6'}`}>
                  {PRODUCTS.map((p, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      onClick={() => { setSelectedProductII(idx); setTryOnEnabled(true); }}
                      className={`w-16 h-16 p-0 rounded-xl overflow-hidden shadow-lg flex items-center justify-center transition-transform ${selectedProductII === idx ? 'ring-4 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
                      title={p.icon}
                    >
                      <img src={p.overlay} alt={p.icon} className="w-full h-full object-cover block" />
                    </Button>
                  ))}
                </aside>

                <div className={`flex flex-col h-full ${swapLayout ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                  {/* Camera sau */}
                  <div className="relative flex-1 px-0 md:px-1 lg:px-2 overflow-hidden rounded-2xl flex items-center justify-center">
                    <div className="w-full h-full max-w-full max-h-full aspect-[1/1] md:aspect-video">
                      <video
                        ref={videoIRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover brightness-[1.15] contrast-[1.1] block rounded-2xl"
                      />
                    </div>
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-white">Camera I</p>
                    </div>
                    <Button
                      onClick={() => setArEnabledI(!arEnabledI)}
                      title="Bật Model I"
                      className={`absolute top-4 right-4 p-4 size-12 rounded-full transition z-20 ${arEnabledI ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' : 'bg-orange-600/60 ring-4 ring-orange-600/30'}`}
                    >
                      <RectangleGoggles className="size-6 text-white" />
                    </Button>
                  </div>

                  {/* Camera trước */}
                  <div className="relative flex-1 px-0 md:px-1 lg:px-2 overflow-hidden rounded-2xl flex items-center justify-center">
                    <div className="w-full h-full max-w-full max-h-full aspect-[1/1] md:aspect-video">
                      <video
                        ref={videoIIRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover brightness-[1.2] scale-x-[-1] block rounded-2xl"
                      />
                    </div>
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <p className="text-white">Camera II</p>
                    </div>
                    <Button
                      onClick={() => setArEnabledII(!arEnabledII)}
                      title="Bật Model II"
                      className={`absolute size-12 top-4 right-4 p-4 rounded-full transition z-20 ${arEnabledII ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' : 'bg-orange-600/60 ring-4 ring-orange-600/30'}`}
                    >
                      <RectangleGoggles className="size-6 text-white" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Khi chỉ còn 1 camera */
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <div className={`absolute top-25 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 right-3`}>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <p className="text-white">Model I</p>
                </div>

                {/* Product List cho Model I */}
                <aside className={`absolute bottom-0.5 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3 right-6`}>
                  {PRODUCTS.map((p, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      onClick={() => { setSelectedProductI(idx); setTryOnEnabled(true); }}
                      className={`w-16 h-16 p-0 rounded-xl overflow-hidden shadow-lg flex items-center justify-center transition-transform ${selectedProductI === idx ? 'ring-4 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
                      title={p.icon}
                    >
                      <img src={p.overlay} alt={p.icon} className="w-full h-full object-cover block" />
                    </Button>
                  ))}
                </aside>
                <div className="w-full max-w-[70%] max-h-[90%] border-0 rounded-2xl overflow-hidden shadow-2xl">
                  <video
                    ref={videoIRef}
                    playsInline
                    muted
                    className="w-full h-full object-contain brightness-[1.15] contrast-[1.1] block rounded-2xl"
                  />
                </div>
                <div className="absolute top-20 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-white">Camera I</p>
                </div>
                <Button
                  onClick={() => setArEnabledI(!arEnabledI)}
                  title="Bật Model"
                  className={`absolute size-12 top-40 left-10 p-4 rounded-full transition z-20 ${arEnabledI ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' : 'bg-orange-600/60 ring-4 ring-orange-600/30'}`}
                >
                  <RectangleGoggles className="size-6 text-white" />
                </Button>
                {/* Nút bật lại camera II khi đã tắt */}
                <Button className="absolute size-12 top-60 left-10 p-4 rounded-full bg-indigo-500/80 ring-4 ring-indigo-500/30 hover:bg-indigo-700 shadow-2xl"
                  title="Bật chế độ so sanh (2 camera)"
                  onClick={() => setCameraIIEnabled(true)}
                >
                  <Layers2 className="size-6 text-white" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ==================== THANH ĐIỀU KHIỂN DƯỚI (cập nhật nút Try-On) ==================== */}
        <div
          ref={arContainerRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-xl px-6 py-4 rounded-full shadow-2xl z-10 no-dismiss">
          <Button
            onClick={() => setSwapLayout(!swapLayout)}
            title="Swap Layout"
            className="p-4 size-12 rounded-full hover:bg-white/20 transition">
            <FlipHorizontal className="size-6 text-white" />
          </Button>

          <Button
            onClick={() => setTryOnEnabled(!tryOnEnabled)}
            title="Config Color Try-On"
            className={`p-4 size-12 rounded-full transition ${tryOnEnabled ? 'bg-indigo-500 ring-4 ring-indigo-500/30' : 'bg-white/20'}`}>
            <Palette className="size-6" />
          </Button>

          <Button
            onClick={() => setSlidersOpen(!slidersOpen)}
            title="Config Try-On"
            className="p-4 size-12 rounded-full hover:bg-white/20 transition">
            <Settings2 className={`size-6 text-white transition-transform ${slidersOpen ? 'rotate-90' : ''}`} />
          </Button>

          <Button
            onClick={() => setShowSettings(!showSettings)}
            title="Setting Button"
            className="p-4 size-12 rounded-full hover:bg-white/20 transition relative"
          >
            <Settings className={`size-6 text-white transition-transform ${showSettings ? 'rotate-90' : ''}`} />
          </Button>

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
                <span className="text-white">Chế độ so sánh</span>
                <button
                  onClick={() => setCameraIIEnabled(!CameraIIEnabled)}
                  className={`w-14 h-8 rounded-full transition ${CameraIIEnabled ? 'bg-purple-500' : 'bg-gray-600'} relative`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${CameraIIEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
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
    </>
  );
}