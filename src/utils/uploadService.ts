import { UploadResponse } from '../types';
import { supabase } from '../lib/supabase';

export async function uploadImageToCloudinary(
  file: File,
  folderName: string = 'uploads'
): Promise<UploadResponse> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error('User not authenticated');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folderName);

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-to-cloudinary`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Upload failed');
  }

  return await response.json();
}
