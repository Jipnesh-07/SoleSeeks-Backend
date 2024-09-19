const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary'); // Ensure the cloudinary config file exists

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sneakult', // Name of the folder in Cloudinary
    allowedFormats: ['jpg', 'jpeg', 'png'],
  },
});

// Multer middleware for image upload
const upload = multer({ storage });

module.exports = upload;
