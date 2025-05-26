'use client';

import { useState, useCallback, useRef } from 'react';
import { useAddCar } from '@/contexts/AddCarContext';
import { Upload, X, Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotosStepProps {
  uploadProgress?: { [key: number]: number };
}

export default function PhotosStep({ uploadProgress = {} }: PhotosStepProps) {
  const { draftState, updatePhotos } = useAddCar();
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photos = draftState.photos;

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    
    return null;
  };

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    // Check total count
    const totalFiles = photos.length + validFiles.length;
    if (totalFiles > 5) {
      validationErrors.push('Maximum 5 photos allowed');
      validFiles.splice(5 - photos.length); // Keep only allowed number
    }

    setErrors(validationErrors);

    if (validFiles.length > 0) {
      updatePhotos([...photos, ...validFiles]);
    }
  }, [photos, updatePhotos]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    updatePhotos(newPhotos);
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos];
    const [removed] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, removed);
    updatePhotos(newPhotos);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-white font-medium mb-2 flex items-center">
          <Camera className="h-5 w-5 mr-2" />
          Photo Guidelines
        </h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Upload 3-5 high-quality photos</li>
          <li>• Include exterior, interior, and dashboard views</li>
          <li>• Take photos in good lighting</li>
          <li>• First photo will be used as the main listing image</li>
        </ul>
      </div>

      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-[#FF2800] bg-[#FF2800]/5'
            : photos.length >= 5
            ? 'border-gray-600 bg-gray-800/30'
            : 'border-gray-600 hover:border-gray-500 bg-[#2A2A2A]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={photos.length >= 5}
        />
        
        {photos.length >= 5 ? (
          <div className="text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-3" />
            <p>Maximum 5 photos reached</p>
          </div>
        ) : (
          <div className="text-gray-400">
            <Upload className="h-12 w-12 mx-auto mb-3" />
            <p className="text-lg font-medium text-white mb-2">
              {dragActive ? 'Drop photos here' : 'Upload car photos'}
            </p>
            <p className="text-sm mb-4">
              Drag and drop images here, or{' '}
              <button
                type="button"
                onClick={openFileDialog}
                className="text-[#FF2800] hover:text-[#FF2800]/80 underline"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG up to 10MB each
            </p>
          </div>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-300 font-medium mb-1">Upload Errors</h3>
              <ul className="text-red-200 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div>
          <h3 className="text-white font-medium mb-3">
            Uploaded Photos ({photos.length}/5)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={`${photo.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-square bg-[#2A2A2A] rounded-xl overflow-hidden border border-gray-700/50"
                >
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Car photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Progress overlay */}
                  {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm">{uploadProgress[index]}%</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Main photo indicator */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-[#FF2800] text-white text-xs px-2 py-1 rounded">
                      Main
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  
                  {/* Reorder buttons */}
                  {photos.length > 1 && (
                    <div className="absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {index > 0 && (
                        <button
                          onClick={() => movePhoto(index, index - 1)}
                          className="w-6 h-6 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs flex items-center justify-center"
                        >
                          ←
                        </button>
                      )}
                      {index < photos.length - 1 && (
                        <button
                          onClick={() => movePhoto(index, index + 1)}
                          className="w-6 h-6 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs flex items-center justify-center"
                        >
                          →
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {photos.length < 3 && (
            <p className="text-yellow-400 text-sm mt-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              At least 3 photos required to continue
            </p>
          )}
        </div>
      )}

      {/* Photo Tips */}
      <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-white font-medium mb-3">📸 Photo Tips</h3>
        <div className="grid grid-cols-1 gap-3 text-sm text-gray-400">
          <div>
            <span className="text-white font-medium">Exterior:</span> Front, side, and rear views
          </div>
          <div>
            <span className="text-white font-medium">Interior:</span> Dashboard, seats, and cargo space
          </div>
          <div>
            <span className="text-white font-medium">Details:</span> Special features, condition highlights
          </div>
        </div>
      </div>
    </div>
  );
} 