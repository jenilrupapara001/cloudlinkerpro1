import express from 'express';
import upload from '../middleware/multer.js';
import Upload from '../models/Upload.js';

const router = express.Router();

// Upload route
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Save to database
    const newUpload = new Upload({
      filename: req.file.filename,
      originalName: req.file.originalname,
      secureUrl: req.file.path,
      publicId: req.file.filename, // Cloudinary filename is the public_id
      size: req.file.size,
      format: req.file.format || req.file.mimetype.split('/')[1],
    });

    await newUpload.save();

    // Return only the secure_url
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

// Get all uploads
router.get('/', async (req, res) => {
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
});

export default router;