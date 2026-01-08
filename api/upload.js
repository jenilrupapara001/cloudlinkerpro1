import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../server/config/cloudinary.js';
import connectDB from '../server/config/database.js';
import Upload from '../server/models/Upload.js';

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.'), false);
  }
};

// Create multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://cloudlinkerpro.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  if (req.method === 'POST') {
    // Handle file upload
    upload.single('image')(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: 'File too large. Maximum size is 5MB.'
            });
          }
        }
        return res.status(400).json({
          success: false,
          error: err.message || 'Upload failed'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      try {
        // Save to database
        const newUpload = new Upload({
          filename: req.file.filename,
          originalName: req.file.originalname,
          secureUrl: req.file.path,
          publicId: req.file.filename,
          size: req.file.size,
          format: req.file.format || req.file.mimetype.split('/')[1],
        });

        await newUpload.save();

        res.status(200).json({
          success: true,
          secure_url: req.file.path
        });
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    });
  } else if (req.method === 'GET') {
    // Handle get uploads
    try {
      const uploads = await Upload.find().sort({ uploadedAt: -1 });
      res.status(200).json({
        success: true,
        uploads: uploads.map(upload => ({
          id: upload._id,
          filename: upload.filename,
          originalName: upload.originalName,
          secureUrl: upload.secureUrl,
          size: upload.size,
          format: upload.format,
          uploadedAt: upload.uploadedAt,
        }))
      });
    } catch (error) {
      console.error('Get uploads error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`
    });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};