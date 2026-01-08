# Cloudinary Upload Server

A production-ready Node.js Express server for direct image upload to Cloudinary.

## Features

- Direct image upload to Cloudinary
- File validation (JPG, JPEG, PNG, WEBP only)
- File size limit (5MB)
- Rate limiting
- CORS support
- Security headers
- Error handling
- Health check endpoint

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Cloudinary credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
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
│   └── cloudinary.js      # Cloudinary configuration
├── middleware/
│   └── multer.js          # Multer storage setup
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