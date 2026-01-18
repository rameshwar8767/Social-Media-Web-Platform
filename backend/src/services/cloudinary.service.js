import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Image upload + optimization
export const uploadImage = async (filePath, folder = 'social_media') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
      quality: 'auto:good',  // Auto compression
      format: 'auto',        // WebP/AVIF
      width: 1080,           // Max width
      height: 1080,
      crop: 'limit',         // Don't stretch
      fetch_format: 'auto'
    });
    
    fs.unlinkSync(filePath);  // Cleanup
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Video upload + thumbnail
export const uploadVideo = async (filePath, folder = 'social_media') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'video',
      quality: 'auto:good',
      format: 'mp4',
      width: 720,  // 720p for reels
      height: 1280,
      crop: 'limit',
      video_codec: 'h264'  // Web compatible
    });

    // Generate thumbnail at 1s
    const thumbnailResult = await cloudinary.api.create_upload_preset({
      folder: `${folder}/thumbnails`,
      resource_type: 'video'
    });

    const thumbnail = await cloudinary.uploader.upload(
      result.secure_url + '/v1:1',  // 1st second frame
      { public_id: result.public_id + '_thumb' }
    );

    fs.unlinkSync(filePath);
    
    return {
      video: {
        url: result.secure_url,
        public_id: result.public_id,
        duration: result.duration
      },
      thumbnail: {
        url: thumbnail.secure_url,
        public_id: thumbnail.public_id
      }
    };
  } catch (error) {
    throw new Error(`Video upload failed: ${error.message}`);
  }
};

// Story media (square, optimized)
export const uploadStoryMedia = async (filePath, folder = 'social_media/stories') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
    quality: 'auto:eco',  // Max compression
    width: 1080,
    height: 1920,
    crop: 'fill',
    gravity: 'auto',
    format: 'auto'
  });
  
  fs.unlinkSync(filePath);
  return {
    url: result.secure_url,
    public_id: result.public_id
  };
};

// Chat media (small, fast)
export const uploadChatMedia = async (filePath, folder = 'social_media/chats') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
    quality: 'auto:low',
    width: 800,
    height: 800,
    crop: 'limit'
  });
  
  fs.unlinkSync(filePath);
  return {
    url: result.secure_url,
    public_id: result.public_id
  };
};

// Optimized URL generator
export const getOptimizedUrl = (publicId, type = 'image', options = {}) => {
  const transformations = {
    quality: 'auto:good',
    format: 'auto',
    ...options
  };

  return cloudinary.url(publicId, {
    resource_type: type,
    transformation: transformations
  });
};

// Delete media (cleanup)
export const deleteMedia = async (publicId, resourceType = 'image') => {
  await cloudinary.uploader.destroy(publicId, { 
    resource_type: resourceType 
  });
};

export default cloudinary;
