import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  secureUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  format: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Upload', uploadSchema);