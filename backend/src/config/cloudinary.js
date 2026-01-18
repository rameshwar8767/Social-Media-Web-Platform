import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (filePath) => {
  try {
    const { secure_url, public_id } = await cloudinary.uploader.upload(filePath, {
      folder: 'social_media/posts',
      resource_type: 'auto'  // image/video
    });
    return { url: secure_url, public_id };
  } catch (error) {
    throw new Error('Cloudinary upload failed');
  }
};

export default cloudinary;
