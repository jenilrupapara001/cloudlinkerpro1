import { useState, useCallback, useEffect } from 'react';
import { Download, FileSpreadsheet, Cloud } from 'lucide-react';
import FileUploader from './components/FileUploader';
import UploadProgress from './components/UploadProgress';
import { ImageUploadStatus } from './types';
import { uploadImageToCloudinary } from './utils/uploadService';
import { exportToCSV, exportToExcel } from './utils/exportService';

interface UploadData {
  id: string;
  filename: string;
  originalName: string;
  secureUrl: string;
  size: number;
  format: string;
  uploadedAt: string;
}

function App() {
  const [images, setImages] = useState<ImageUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [allUploads, setAllUploads] = useState<UploadData[]>([]);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/api/upload`;
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAllUploads(data.uploads);
        }
      }
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    }
  };

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const newImages: ImageUploadStatus[] = files.map(file => ({
      name: file.name,
      file,
      status: 'pending' as const,
    }));

    setImages(newImages);
    setIsUploading(true);

    for (let i = 0; i < newImages.length; i++) {
      const image = newImages[i];

      setImages(prev => prev.map((img, idx) =>
        idx === i ? { ...img, status: 'uploading' as const } : img
      ));

      try {
        const result = await uploadImageToCloudinary(image.file, 'cloudlinkerpro');

        if (result.success && result.secure_url) {
          setImages(prev => prev.map((img, idx) =>
            idx === i
              ? { ...img, status: 'completed' as const, url: result.secure_url }
              : img
          ));
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        setImages(prev => prev.map((img, idx) =>
          idx === i
            ? {
                ...img,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : img
        ));
      }
    }

    setIsUploading(false);
    // Refresh uploads after upload
    fetchUploads();
  }, []);

  const handleReset = () => {
    setImages([]);
  };

  const completedCount = images.filter(img => img.status === 'completed').length;
  const canExport = completedCount > 0 && !isUploading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cloud className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CloudLinkerPro
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Upload images to Cloudinary and generate downloadable spreadsheets with URLs
          </p>
        </header>

        <div className="space-y-6">
          {images.length === 0 ? (
            <FileUploader
              onFilesSelected={handleFilesSelected}
              disabled={isUploading}
            />
          ) : (
            <>
              <UploadProgress images={images} />

              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => exportToCSV(images)}
                  disabled={!canExport}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Export to CSV
                </button>

                <button
                  onClick={() => exportToExcel(images)}
                  disabled={!canExport}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Export to Excel
                </button>

                <button
                  onClick={handleReset}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  Upload New Batch
                </button>
              </div>

              {canExport && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-800 font-medium">
                    Upload complete! Click the export buttons above to download your spreadsheet.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Powered by Cloudinary &amp; Supabase</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
