
// Cloudinary configuration and utility functions
export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

// Cloudinary configuration with user's credentials
export const cloudinaryConfig: CloudinaryConfig = {
  cloudName: 'dtunivr9v',
  uploadPreset: 'i5n1rxe8',
};

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
  format: string;
  resource_type: string;
  bytes: number;
}

export const validateAudioFile = (file: File): boolean => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/ogg'];
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
