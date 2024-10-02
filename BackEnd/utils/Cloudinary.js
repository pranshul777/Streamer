const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises; // Use promises for async file operations
const { customApiError } = require('./ApiError'); // Assuming you have a custom error handler

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.Cloud_Name,
    api_key: process.env.API_key,
    api_secret: process.env.API_Secret
});

// Image Uploader
const imageUploader = async (localFilePath, next) => {
    try {
        console.log(`Starting image upload. Local path: ${localFilePath}`);

        if (!localFilePath) {
            return next(customApiError(500, "No local file path provided for image upload."));
        }

        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'image'
        });
        console.log('Image upload success:', uploadResult);

        await fs.unlink(localFilePath); // Delete local file after upload
        console.log(`Local image file deleted: ${localFilePath}`);
        
        return uploadResult;
    } catch (err) {
        console.error('Error during image upload:', err.message);
        try {
            await fs.unlink(localFilePath);
            console.log(`Local image file deleted after error: ${localFilePath}`);
        } catch (unlinkErr) {
            console.error('Error deleting local image file:', unlinkErr.message);
        }
        next(customApiError(500, err.message));
    }
};

// Video Uploader
const videoUploader = async (localFilePath, next) => {
    try {
        console.log(`Starting video upload. Local path: ${localFilePath}`);

        if (!localFilePath) {
            return next(customApiError(500, "No local file path provided for video upload."));
        }

        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'video',
            chunk_size: 6000000 // Optional: Chunk size for large videos
        });
        console.log('Video upload success:', uploadResult);

        await fs.unlink(localFilePath); // Delete local file after upload
        console.log(`Local video file deleted: ${localFilePath}`);
        
        return uploadResult;
    } catch (err) {
        console.error('Error during video upload:', err.message);
        try {
            await fs.unlink(localFilePath);
            console.log(`Local video file deleted after error: ${localFilePath}`);
        } catch (unlinkErr) {
            console.error('Error deleting local video file:', unlinkErr.message);
        }
        next(customApiError(500, err.message));
    }
};

// Image Deleter
const deleteImage = async (publicID) => {
    try {
        console.log(`Starting image deletion. Public ID: ${publicID}`);

        const result = await cloudinary.uploader.destroy(publicID, {
            resource_type: 'image'
        });
        console.log('Image deleted successfully:', result);
        
        return result;
    } catch (err) {
        console.error('Error deleting image:', err.message);
        throw new Error('Failed to delete image.');
    }
};

// Video Deleter
const deleteVideo = async (publicID) => {
    try {
        console.log(`Starting video deletion. Public ID: ${publicID}`);

        const result = await cloudinary.uploader.destroy(publicID, {
            resource_type: 'video'
        });
        console.log('Video deleted successfully:', result);
        
        return result;
    } catch (err) {
        console.error('Error deleting video:', err.message);
        throw new Error('Failed to delete video.');
    }
};

// Export all the functions
module.exports = {
    imageUploader,
    videoUploader,
    deleteImage,
    deleteVideo
};
