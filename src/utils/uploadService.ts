import { UploadResponse } from '../types';

export async function uploadImageToCloudinary(
  file: File,
  folderName: string = 'uploads'
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const apiUrl = `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/api/upload/image`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Upload failed');
  }

  return await response.json();
}
