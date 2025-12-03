import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ImageUploadStatus } from '../types';

interface UploadProgressProps {
  images: ImageUploadStatus[];
}

export default function UploadProgress({ images }: UploadProgressProps) {
  if (images.length === 0) return null;

  const completed = images.filter(img => img.status === 'completed').length;
  const errors = images.filter(img => img.status === 'error').length;
  const uploading = images.filter(img => img.status === 'uploading').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Upload Progress</h3>
          <span className="text-sm text-gray-600">
            {completed} / {images.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(completed / images.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex gap-4 text-sm mb-4">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-gray-600">{completed} completed</span>
        </div>
        {uploading > 0 && (
          <div className="flex items-center gap-1.5">
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-gray-600">{uploading} uploading</span>
          </div>
        )}
        {errors > 0 && (
          <div className="flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">{errors} failed</span>
          </div>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2">
        {images.map((image, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {image.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
              {image.status === 'uploading' && (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
              )}
              {image.status === 'error' && (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              {image.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {image.name}
                </p>
                {image.error && (
                  <p className="text-xs text-red-500 truncate">{image.error}</p>
                )}
              </div>
            </div>

            {image.url && (
              <a
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex-shrink-0 ml-2"
              >
                View
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
