import { useEffect, useState, useRef, use } from 'react';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
  showColorPicker: boolean;
  setShowColorPicker: (is: boolean) => void;
  name: string;
}

export const MyColorPickerComponent = ({ color, setColor, showColorPicker, setShowColorPicker, name }: ColorPickerProps) => {

  const [customHex, setCustomHex] = useState("#FF0000");
  const colorRef = useRef<HTMLDivElement | null>(null);

  const presetColors = [
    "#FF0000", "#FF6B6B", "#FFA500", "#FFD700", "#00FF00", "#00CED1",
    "#0000FF", "#9370DB", "#FF00FF", "#FF1493", "#FFFFFF", "#000000",
    "#8B4513", "#2F4F4F", "#708090", "#20B2AA", "#FF4500", "#DC143C"
  ];

  const handleHexInput = (value: string) => {
    if (!value.startsWith("#")) {
      value = "#" + value;
    }
    setCustomHex(value.toUpperCase());
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setColor(value.toUpperCase());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!colorRef.current) return;
      if (!colorRef.current.contains(target) && !(target instanceof Element && target.closest('.no-dismiss-color'))) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker, setShowColorPicker]);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <div className="relative w-full h-full pointer-events-auto">
        {/* Color Picker Button */}
        <div className="absolute bottom-100 left-140 transform -translate-x-1/2 z-10">
          {/* Color Picker Panel */}
          {showColorPicker && (
            <div
              ref={colorRef}
              className="absolute bg-white p-4 rounded-lg shadow-xl w-64">
              {/* Hex Input */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Color của model {name}</p>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const color = e.target.value.toUpperCase();
                      setColor(color);
                      setCustomHex(color);
                    }}
                    className="w-12 h-10 rounded-md cursor-pointer border border-gray-300"
                  />
                </div>
              </div>

              {/* Preset Colors */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Màu gợi ý</p>
                <div className="grid grid-cols-6 gap-2">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColor(c);
                        setCustomHex(c);
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${color === c
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-400'
                        }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyColorPickerComponent;