const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageToCloudinary = async (imageFile) => {
    try {
        const cloudinaryResult = await cloudinary.uploader.upload(imageFile.path, {
            folder: 'sneakult', // Optional: specify the folder where the image will be saved
            public_id: `post_image_${Date.now()}`, // Optional: specify the public ID
        });

        return cloudinaryResult.secure_url; // Return the URL of the uploaded image
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Error uploading image to Cloudinary');
    }
};

module.exports = uploadImageToCloudinary;