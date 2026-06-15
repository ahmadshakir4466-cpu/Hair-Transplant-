import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedAreaPixels: Area) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, aspectRatio = 16 / 9 }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = () => {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-slate-800">Crop Image</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="relative w-full h-[50vh] bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-6 bg-white border-t border-slate-100 space-y-6">
            <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Zoom</label>
                <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
                />
            </div>
            <div className="flex justify-end gap-3 text-right">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors"
                >
                    Apply Crop
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
