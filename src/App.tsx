import { useState, useCallback, useEffect } from 'react';
import { Download, FileSpreadsheet, Cloud, LogIn, UserPlus } from 'lucide-react';
import FileUploader from './components/FileUploader';
import UploadProgress from './components/UploadProgress';
import { ImageUploadStatus } from './types';
import { uploadImageToCloudinary } from './utils/uploadService';
import { exportToCSV, exportToExcel } from './utils/exportService';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

function App() {
  const [images, setImages] = useState<ImageUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

        if (result.success && result.url) {
          setImages(prev => prev.map((img, idx) =>
            idx === i
              ? { ...img, status: 'completed' as const, url: result.url }
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
  }, []);

  const handleReset = () => {
    setImages([]);
  };

  const completedCount = images.filter(img => img.status === 'completed').length;
  const canExport = completedCount > 0 && !isUploading;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Cloud className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CloudLinkerPro
            </h1>
            <p className="text-gray-600 mt-2">Sign in to upload images</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {authError && <p className="text-red-600 text-sm">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {authMode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cloud className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CloudLinkerPro
            </h1>
            <button
              onClick={handleLogout}
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              Logout
            </button>
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
