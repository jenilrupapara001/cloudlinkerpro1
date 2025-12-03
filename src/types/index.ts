export interface ImageUploadStatus {
  name: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
  progress?: number;
}

export interface UploadResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}
