'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Image, Upload, X, RotateCcw, Move, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { COLORS } from '@/constants/colors';

interface EditPhotosStepProps {
  carData: any;
  onUpdate: (data: any) => void;
}

export default function EditPhotosStep({ carData, onUpdate }: EditPhotosStepProps) {
  const [photos, setPhotos] = useState<string[]>(carData.images || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock photo URLs for demonstration (would be replaced with actual upload URLs)
  const mockPhotos = [
    '/api/placeholder/300/300?car1',
    '/api/placeholder/300/300?car2',
    '/api/placeholder/300/300?car3',
    '/api/placeholder/300/300?car4',
    '/api/placeholder/300/300?car5'
  ];

  // Update parent when photos change
  useEffect(() => {
    const hasPhotoChanges = JSON.stringify(photos) !== JSON.stringify(carData.images || []);
    setHasChanges(hasPhotoChanges);

    if (hasPhotoChanges) {
      onUpdate({
        ...carData,
        images: photos
      });
    }
  }, [photos, carData, onUpdate]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      
      // Simulate upload delay
      setTimeout(() => {
        // In a real app, you would upload to your storage service here
        const newPhotos = Array.from(files).map((_, index) => 
          mockPhotos[Math.floor(Math.random() * mockPhotos.length)]
        );
        setPhotos(prev => [...prev, ...newPhotos].slice(0, 10)); // Max 10 photos
        setIsUploading(false);
      }, 1500);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos];
    const [movedPhoto] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, movedPhoto);
    setPhotos(newPhotos);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      movePhoto(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const addSamplePhotos = () => {
    setIsUploading(true);
    setTimeout(() => {
      const samplePhotos = mockPhotos.slice(0, 3);
      setPhotos(prev => [...prev, ...samplePhotos].slice(0, 10));
      setIsUploading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Changes Indicator */}
      {hasChanges && (
        <GlassCard gradient="accent" padding="sm">
          <div className="flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-2" style={{ color: COLORS.primary.red }} />
            <span style={{ color: COLORS.primary.red }}>Unsaved changes detected</span>
          </div>
        </GlassCard>
      )}

      {/* Upload Section */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
          <div 
            className="w-6 h-6 rounded-lg flex items-center justify-center mr-2"
            style={{ backgroundColor: `${COLORS.primary.red}33` }}
          >
            <Camera className="h-4 w-4" style={{ color: COLORS.primary.red }} />
          </div>
          Car Photos ({photos.length}/10)
        </label>

        {/* Upload Area */}
        <GlassCard 
          padding="lg" 
          className={`border-2 border-dashed transition-colors cursor-pointer hover:border-gray-500 ${
            isUploading ? 'border-blue-500 bg-blue-500/5' : 'border-gray-600'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            {isUploading ? (
              <div className="space-y-3">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-blue-400 font-medium">Uploading photos...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                  style={{ backgroundColor: `${COLORS.primary.red}20` }}
                >
                  <Upload className="h-6 w-6" style={{ color: COLORS.primary.red }} />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Upload Car Photos</p>
                  <p className="text-gray-400 text-sm">
                    Drag & drop or click to select photos (Max 10)
                  </p>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading || photos.length >= 10}
        />

        {/* Quick Add Demo Photos */}
        {photos.length === 0 && !isUploading && (
          <div className="mt-3">
            <button
              onClick={addSamplePhotos}
              className="w-full py-2 px-4 text-sm text-gray-300 border border-gray-600 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
            >
              Add Sample Photos (Demo)
            </button>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-3 flex items-center">
            <Image className="h-4 w-4 mr-2" style={{ color: COLORS.primary.red }} />
            Manage Photos
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative group aspect-square bg-gray-700 rounded-lg overflow-hidden border-2 transition-all cursor-move ${
                  draggedIndex === index 
                    ? 'border-blue-500 scale-105' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <img
                  src={photo}
                  alt={`Car photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Primary Photo Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white rounded-lg"
                       style={{ backgroundColor: COLORS.primary.red }}>
                    Primary
                  </div>
                )}

                {/* Photo Index */}
                <div className="absolute bottom-2 left-2 w-6 h-6 bg-black/70 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {index + 1}
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(index);
                    }}
                    className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Drag Handle */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Move className="h-4 w-4 text-white/70" />
                </div>
              </div>
            ))}
            
            {/* Add More Button */}
            {photos.length < 10 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                <Plus className="h-6 w-6 mb-1" />
                <span className="text-xs">Add More</span>
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${COLORS.primary.red}10` }}>
            <div className="flex items-start space-x-2">
              <Camera className="h-4 w-4 mt-0.5" style={{ color: COLORS.primary.red }} />
              <div className="text-xs text-gray-300">
                <span style={{ color: COLORS.primary.red }} className="font-medium">Photo tips:</span>
                <br />
                • The first photo will be your primary listing image
                <br />
                • Include exterior, interior, and detail shots
                <br />
                • Good lighting and multiple angles attract more renters
                <br />
                • Drag photos to reorder them
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Requirements */}
      <GlassCard padding="md">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center">
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          Photo Requirements
        </h4>
        <div className="space-y-2 text-xs">
          <div className={`flex items-center ${photos.length >= 3 ? 'text-green-400' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${photos.length >= 3 ? 'bg-green-400' : 'bg-gray-500'}`}></div>
            At least 3 photos (recommended)
          </div>
          <div className={`flex items-center ${photos.length >= 1 ? 'text-green-400' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${photos.length >= 1 ? 'bg-green-400' : 'bg-gray-500'}`}></div>
            Primary photo (front/exterior view)
          </div>
          <div className="flex items-center text-gray-400">
            <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
            Interior and detail shots (optional)
          </div>
        </div>
      </GlassCard>

      {/* Updated Preview */}
      {photos.length > 0 && (
        <GlassCard gradient="accent" className="border-2">
          <div className="flex items-start space-x-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.primary.red}33` }}
            >
              <Image className="h-6 w-6" style={{ color: COLORS.primary.red }} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-1" style={{ color: COLORS.primary.red }}>Photo Summary</h3>
              <p className="text-white font-semibold text-lg mb-2">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
              </p>
              <div className="grid grid-cols-5 gap-1">
                {photos.slice(0, 5).map((photo, index) => (
                  <div key={index} className="aspect-square bg-gray-700 rounded overflow-hidden">
                    <img src={photo} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
} 