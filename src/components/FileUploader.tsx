import { useCallback, useState } from 'react';
import { Upload, FolderOpen } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export default function FileUploader({ onFilesSelected, disabled }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const items = Array.from(e.dataTransfer.items);
    const imageFiles: File[] = [];

    items.forEach((item) => {
      const file = item.getAsFile();
      if (file && file.type.startsWith('image/')) {
        imageFiles.push(file);
      }
    });

    if (imageFiles.length > 0) {
      onFilesSelected(imageFiles);
    }
  }, [onFilesSelected, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const imageFiles = Array.from(files).filter(file =>
        file.type.startsWith('image/')
      );
      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    }
  }, [onFilesSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center transition-all
        ${isDragging
          ? 'border-blue-500 bg-blue-50 scale-[1.02]'
          : 'border-gray-300 bg-white hover:border-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        webkitdirectory=""
        directory=""
      />

      <div className="flex flex-col items-center gap-4">
        {isDragging ? (
          <Upload className="w-16 h-16 text-blue-500 animate-bounce" />
        ) : (
          <FolderOpen className="w-16 h-16 text-gray-400" />
        )}

        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {isDragging ? 'Drop your images here' : 'Upload Image Folder'}
          </h3>
          <p className="text-gray-500">
            Drag and drop your folder here, or click to browse
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Supports: JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>
    </div>
  );
}
