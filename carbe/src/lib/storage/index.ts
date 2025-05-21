import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a file to Supabase Storage
 * @param file File to upload
 * @param bucket Bucket to upload to
 * @param path Optional path within the bucket
 * @returns URL of the uploaded file
 */
export async function uploadFile(
  file: File,
  bucket: string = 'cars',
  path?: string
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get the public URL for the file
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Upload multiple files to Supabase Storage
 * @param files Array of files to upload
 * @param bucket Bucket to upload to
 * @param path Optional path within the bucket
 * @returns Array of URLs of the uploaded files
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: string = 'cars',
  path?: string
): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadFile(file, bucket, path));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param url URL of the file to delete
 * @param bucket Bucket the file is stored in
 * @returns Boolean indicating success
 */
export async function deleteFile(url: string, bucket: string = 'cars'): Promise<boolean> {
  try {
    // Extract the path from the URL
    // The URL format is typically: https://xxx.supabase.co/storage/v1/object/public/bucket/filepath
    const pathParts = url.split(`${bucket}/`);
    if (pathParts.length < 2) {
      throw new Error('Invalid file URL');
    }
    
    const filePath = pathParts[1];
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Update file in Supabase Storage (delete old + upload new)
 * @param oldUrl URL of the existing file
 * @param newFile New file to upload
 * @param bucket Bucket to use
 * @param path Optional path within the bucket
 * @returns URL of the new file
 */
export async function updateFile(
  oldUrl: string | null,
  newFile: File,
  bucket: string = 'cars',
  path?: string
): Promise<string> {
  try {
    // Delete the old file if it exists
    if (oldUrl) {
      await deleteFile(oldUrl, bucket);
    }
    
    // Upload the new file
    return await uploadFile(newFile, bucket, path);
  } catch (error) {
    console.error('Error updating file:', error);
    throw error;
  }
}

/**
 * Get a signed URL for a private file
 * @param filePath Path to the file
 * @param bucket Bucket the file is stored in
 * @param expiresIn Expiration time in seconds (default: 60)
 * @returns Signed URL
 */
export async function getSignedUrl(
  filePath: string,
  bucket: string = 'private',
  expiresIn: number = 60
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      throw error;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
} 