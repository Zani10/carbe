import { supabase } from '@/lib/supabase';
import { AddCarFormData, PhotoUploadProgress } from '@/types/car';

export interface CreateCarResult {
  success: boolean;
  carId?: string;
  error?: string;
}

/**
 * Uploads a single photo to Supabase storage
 */
export async function uploadCarPhoto(
  file: File, 
  carId: string,
  index: number,
  onProgress?: (progress: number) => void
): Promise<{ url?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${carId}/${index}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('car-images')
      .getPublicUrl(fileName);

    onProgress?.(100);
    
    return { url: publicUrl };
  } catch (error) {
    console.error('Error uploading photo:', error);
    return { error: 'Failed to upload photo' };
  }
}

/**
 * Uploads multiple photos and returns their URLs
 */
export async function uploadCarPhotos(
  photos: File[],
  carId: string,
  onProgress?: (photoIndex: number, progress: number) => void
): Promise<{ urls?: string[]; error?: string }> {
  const uploadPromises = photos.map((file, index) => 
    uploadCarPhoto(file, carId, index, (progress) => onProgress?.(index, progress))
  );

  try {
    const results = await Promise.all(uploadPromises);
    
    // Check for any errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      return { error: `Failed to upload ${errors.length} photos` };
    }

    const urls = results.map(result => result.url!);
    return { urls };
  } catch (error) {
    console.error('Error uploading photos:', error);
    return { error: 'Failed to upload photos' };
  }
}

/**
 * Creates a new car listing
 */
export async function createCar(
  formData: AddCarFormData,
  userId: string,
  onPhotoProgress?: (photoIndex: number, progress: number) => void
): Promise<CreateCarResult> {
  try {
    // Generate a temporary car ID for photo uploads
    const tempCarId = crypto.randomUUID();

    // Upload photos first
    const { urls: imageUrls, error: uploadError } = await uploadCarPhotos(
      formData.photos,
      tempCarId,
      onPhotoProgress
    );

    if (uploadError || !imageUrls) {
      return { success: false, error: uploadError || 'Failed to upload photos' };
    }

    // Create car record
    const { data: car, error: insertError } = await supabase
      .from('cars')
      .insert({
        id: tempCarId,
        owner_id: userId,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        description: formData.description || `${formData.year} ${formData.make} ${formData.model}`,
        price_per_day: formData.price_per_day,
        location: formData.location,
        transmission: formData.transmission,
        seats: formData.seats,
        fuel_type: formData.fuel_type,
        range_km: formData.range_km,
        lock_type: formData.lock_type,
        images: imageUrls,
        rating: null // Will be calculated from reviews
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating car:', insertError);
      
      // Clean up uploaded photos if car creation fails
      await Promise.all(
        imageUrls.map(async (_, index) => {
          const fileName = `${tempCarId}/${index}.jpg`;
          await supabase.storage.from('car-images').remove([fileName]);
        })
      );
      
      return { success: false, error: insertError.message };
    }

    return { success: true, carId: car.id };
  } catch (error) {
    console.error('Error in createCar:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
} 