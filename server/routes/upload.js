import express from 'express';
import upload from '../middleware/multer.js';

const router = express.Router();

// Upload route
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Return only the secure_url
    res.status(200).json({
      success: true,
      secure_url: req.file.path // Cloudinary returns the secure URL in path
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;