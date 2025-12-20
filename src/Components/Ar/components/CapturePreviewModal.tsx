import React from 'react';
import { Button } from '@/Components/ui/button';
import { X, Download } from 'lucide-react';

interface CapturePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
  onSave: () => void;
}

export function CapturePreviewModal({ imageUrl, onClose, onSave }: CapturePreviewModalProps) {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-4xl w-full mx-4 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Preview</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-4 flex justify-center items-center max-h-[70vh] overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="AR Capture Preview"
            className="max-w-full max-h-[60vh] object-contain rounded-xl"
          />
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-white/10">
          <Button
            onClick={onClose}
            variant="ghost"
            className="px-6 py-2 rounded-full text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="px-6 py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
