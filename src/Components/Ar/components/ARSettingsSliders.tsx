import React from 'react';
import type { ARSettings, ARModelSettings } from '../types';

interface SliderGroupProps {
  label: string;
  settings: ARModelSettings;
  onSettingsChange: (updates: Partial<ARModelSettings>) => void;
}

function SliderGroup({ label, settings, onSettingsChange }: SliderGroupProps) {
  return (
    <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-56 shadow-2xl">
      <h3 className="text-sm font-bold text-white text-center mb-3">{label}</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-white/70">
            Kích cỡ ({settings.scale}%)
          </label>
          <input
            type="range"
            min="20"
            max="150"
            value={settings.scale}
            onChange={(e) => onSettingsChange({ scale: +e.target.value })}
            className="w-full h-1.5 bg-gray-700 rounded-full"
          />
        </div>
        <div>
          <label className="text-xs text-white/70">Trái ↔ Phải</label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.offsetX}
            onChange={(e) => onSettingsChange({ offsetX: +e.target.value })}
            className="w-full h-1.5 bg-gray-700 rounded-full"
          />
        </div>
        <div>
          <label className="text-xs text-white/70">Lên ↓ Xuống</label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.offsetY}
            onChange={(e) => onSettingsChange({ offsetY: +e.target.value })}
            className="w-full h-1.5 bg-gray-700 rounded-full"
          />
        </div>
        <div>
          <label className="text-xs text-white/70">
            Độ trong suốt ({settings.opacity}%)
          </label>
          <input
            type="range"
            min="30"
            max="100"
            value={settings.opacity}
            onChange={(e) => onSettingsChange({ opacity: +e.target.value })}
            className="w-full h-1.5 bg-gray-700 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

interface ARSettingsSlidersProps {
  settings: ARSettings;
  onSettingsChangeI: (updates: Partial<ARModelSettings>) => void;
  onSettingsChangeII: (updates: Partial<ARModelSettings>) => void;
  show: boolean;
  isDualMode: boolean;
}

export function ARSettingsSliders({ 
  settings, 
  onSettingsChangeI,
  onSettingsChangeII,
  show,
  isDualMode,
}: ARSettingsSlidersProps) {
  if (!show) return null;

  if (isDualMode) {
    return (
      <>
        <div className="absolute bottom-24 left-4 z-50 no-dismiss">
          <SliderGroup
            label="Model I"
            settings={settings.modelI}
            onSettingsChange={onSettingsChangeI}
          />
        </div>
        <div className="absolute bottom-24 right-4 z-50 no-dismiss">
          <SliderGroup
            label="Model II"
            settings={settings.modelII}
            onSettingsChange={onSettingsChangeII}
          />
        </div>
      </>
    );
  }

  return (
    <div className="absolute bottom-24 left-4 z-50 no-dismiss">
      <SliderGroup
        label="Điều chỉnh Model"
        settings={settings.modelI}
        onSettingsChange={onSettingsChangeI}
      />
    </div>
  );
}
