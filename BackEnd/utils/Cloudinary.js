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
const imageUploader = async (localFilePath, next, folderId) => {
    try {
        console.log(`Starting image upload. Local path: ${localFilePath}`);

        if (!localFilePath) {
            return next(customApiError(500, "No local file path provided for image upload."));
        }

        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'image',
            folder : folderId
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
const videoUploader = async (localFilePath, next, folderId) => {
    try {
        console.log(`Starting video upload. Local path: ${localFilePath}`);

        if (!localFilePath) {
            return next(customApiError(500, "No local file path provided for video upload."));
        }

        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'video',
            chunk_size: 6000000, // Optional: Chunk size for large videos
            folder : folderId
        });
        console.log('Video upload success:', uploadResult);

        await fs.unlink(localFilePath); // Delete local file after upload
        console.log(`Local video file deleted: ${localFilePath}`);
        
        return uploadResult.secure_url;
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
const rawUploader = async (localFilePath, next, folderId)=>{
    try {
        console.log(`Starting file upload. Local path: ${localFilePath}`);

        if (!localFilePath) {
            return next(customApiError(500, "No local file path provided for file upload."));
        }

        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'raw', // Use 'raw' for .m3u8 files
            folder: folderId,
        });
        console.log('file upload success:', uploadResult);

        await fs.unlink(localFilePath); // Delete local file after upload
        console.log(`Local file deleted: ${localFilePath}`);
        
        return uploadResult.secure_url;
    } catch (err) {
        console.error('Error during file upload:', err.message);
        try {
            await fs.unlink(localFilePath);
            console.log(`Local file deleted after error: ${localFilePath}`);
        } catch (unlinkErr) {
            console.error('Error deleting local file:', unlinkErr.message);
        }
        next(customApiError(500, err.message));
    }
};

const deleteRaw = async (publicID) => {
    try {
        console.log(`Starting file deletion. Public ID: ${publicID}`);

        const result = await cloudinary.uploader.destroy(publicID, {
            resource_type: 'raw'
        });
        console.log('File deleted successfully:', result);
        
        return result;
    } catch (err) {
        console.error('Error deleting file:', err.message);
        throw new Error("Error in deleting the raw")
    }
};

async function deleteFolder(folderPath, next) {
    try {
      console.log(`Starting deletion process for folder: "${folderPath}"`);
  
      // Step 1: Fetch all resources in the folder (with pagination support)
      let resources = [];
      let nextCursor = null;
  
      console.log("Fetching resources...");
  
      do {
        const result = await cloudinary.api.resources({
          type: "upload",
          prefix: folderPath,
          max_results: 500,
          next_cursor: nextCursor,
        });
  
        resources = resources.concat(result.resources);
        nextCursor = result.next_cursor;
      } while (nextCursor);
  
      console.log(`Found ${resources.length} resources in folder: "${folderPath}"`);
  
      // Step 2: Delete all resources in the folder
      if (resources.length > 0) {
        const publicIds = resources.map((resource) => resource.public_id);
  
        console.log("Deleting resources...");
        const deleteResult = await cloudinary.api.delete_resources(publicIds);
  
        // Verify deletion
        const failedDeletions = Object.keys(deleteResult.deleted).filter(
          (id) => deleteResult.deleted[id] !== "deleted"
        );
  
        if (failedDeletions.length > 0) {
          throw new Error(`Failed to delete some resources: ${failedDeletions.join(", ")}`);
        }
  
        console.log("All resources deleted successfully.");
      } else {
        console.log("No resources found to delete.");
      }
  
      // Step 3: Delete the folder itself
      console.log(`Attempting to delete folder: "${folderPath}"`);
      await cloudinary.api.delete_folder(folderPath);
      console.log(`Folder "${folderPath}" deleted successfully.`);
  
    } catch (error) {
      console.error("Error during folder deletion:", error.message);
        next(customApiError(500, error.message));
    }
  }
// Export all the functions
module.exports = {
    imageUploader,
    videoUploader,
    deleteImage,
    deleteVideo,
    rawUploader,
    deleteRaw,
    deleteFolder
};
