import React from 'react';
import { Button } from '@/Components/ui/button';
import { Glasses, HardHat } from 'lucide-react';
import type { Product } from '../types';

interface ProductSelectorProps {
  products: Product[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  show: boolean;
  onToggle: () => void;
  icon: 'glasses' | 'hat';
  position: 'left' | 'right';
  swapLayout?: boolean;
  topOffset?: string;
}

export function ProductSelector({
  products,
  selectedIndex,
  onSelect,
  show,
  onToggle,
  icon,
  position,
  swapLayout = false,
  topOffset = 'top-20'
}: ProductSelectorProps) {
  const positionClass = swapLayout 
    ? (position === 'left' ? 'right-6' : 'left-6')
    : (position === 'left' ? 'left-6' : 'right-6');
  
  const dropdownPositionClass = swapLayout
    ? (position === 'left' ? 'right-[-6]' : 'left-[-6]')
    : (position === 'left' ? 'left-[-6]' : 'right-[-6]');

  const IconComponent = icon === 'glasses' ? Glasses : HardHat;

  return (
    <div className={`absolute ${topOffset} z-20 ${positionClass}`}>
      <Button
        onClick={onToggle}
        className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center bg-amber-700/70 hover:bg-amber-400 text-white"
        title="Chọn sản phẩm"
      >
        <IconComponent className="size-6" />
      </Button>

      {show && (
        <div className={`absolute mt-3 top-full ${dropdownPositionClass} bg-black/90 rounded-2xl p-2 shadow-2xl flex flex-col gap-2 max-h-36 overflow-y-auto z-30 scrollbar-hide`}>
          {products.map((p, idx) => (
            <Button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={`w-16 h-16 p-0 rounded-xl overflow-hidden shadow-lg flex items-center justify-center transition-transform ${
                selectedIndex === idx 
                  ? 'ring-2 ring-indigo-400 scale-105' 
                  : 'hover:scale-105'
              }`}
              title={p.name || ''}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={p.thumbnailUrl || p.name || ''} 
                alt={p.name || ''} 
                className="w-full h-full object-cover block" 
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
