import { UploadResponse } from '../types';

export async function uploadImageToCloudinary(
  file: File,
  folderName: string = 'uploads'
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folderName);

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-to-cloudinary`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Upload failed');
  }

  return await response.json();
}
