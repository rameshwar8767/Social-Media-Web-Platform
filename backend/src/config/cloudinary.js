import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`${key} is missing in environment variables`);
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  filePath,
  options = {}
) => {
  if (!filePath) {
    throw new Error("File path is required for Cloudinary upload");
  }

  try {
    const response = await cloudinary.uploader.upload(filePath, {
      folder: "social_media/posts",
      resource_type: "auto",
      ...options,
    });

    await fs.unlink(filePath).catch(() => null);

    return {
      url: response.secure_url,
      public_id: response.public_id,
      resource_type: response.resource_type,
      format: response.format,
    };
  } catch (error) {
    await fs.unlink(filePath).catch(() => null);
    throw new Error(error?.message || "Cloudinary upload failed");
  }
};

export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  if (!publicId) {
    throw new Error("publicId is required");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    throw new Error(error?.message || "Cloudinary delete failed");
  }
};

export default cloudinary;