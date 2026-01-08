# Cloudinary Upload Server

A production-ready Node.js Express server for direct image upload to Cloudinary with MongoDB storage.

## Features

- Direct image upload to Cloudinary
- MongoDB storage for upload metadata
- File validation (JPG, JPEG, PNG, WEBP only)
- File size limit (5MB)
- Rate limiting
- CORS support
- Security headers
- Error handling
- Health check endpoint
- Get all uploads endpoint

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install MongoDB locally or use MongoDB Atlas.

4. Create a `.env` file with your credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   MONGODB_URI=mongodb://localhost:27017/cloudinary-uploads
   PORT=3000
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

4. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### POST /api/upload/image

Upload an image file to Cloudinary.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `image` field with the image file

**Response:**
```json
{
  "success": true,
  "secure_url": "https://res.cloudinary.com/.../image.jpg"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### GET /api/uploads

Get all uploaded images metadata.

**Response:**
```json
{
  "success": true,
  "uploads": [
    {
      "id": "507f1f77bcf86cd799439011",
      "filename": "image.jpg",
      "originalName": "my-image.jpg",
      "secureUrl": "https://res.cloudinary.com/.../image.jpg",
      "size": 1024000,
      "format": "jpg",
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## File Restrictions

- **Allowed formats:** JPG, JPEG, PNG, WEBP
- **Maximum file size:** 5MB
- **Automatic resizing:** Images are resized to max 1000x1000 pixels

## Security

- Helmet for security headers
- Rate limiting (100 requests per 15 minutes per IP)
- CORS configuration
- File type validation
- File size limits

## Folder Structure

```
server/
├── config/
│   ├── cloudinary.js      # Cloudinary configuration
│   └── database.js        # MongoDB connection
├── middleware/
│   └── multer.js          # Multer storage setup
├── models/
│   └── Upload.js          # MongoDB upload model
├── routes/
│   └── upload.js          # Upload routes
├── .env                   # Environment variables
├── package.json           # Dependencies
├── server.js              # Main server file
└── README.md              # This file
```

## Usage Example

```javascript
const formData = new FormData();
formData.append('image', file);

fetch('http://localhost:3000/api/upload/image', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Uploaded:', data.secure_url);
  }
});