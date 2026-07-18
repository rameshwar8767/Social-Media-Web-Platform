import fs from "fs/promises";
import cloudinary from "../config/cloudinary.js";

const safeUnlink = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {}
};

const ensureCloudinaryResult = (result, message) => {
  if (!result?.secure_url || !result?.public_id) {
    throw new Error(message);
  }
};

export const uploadImage = async (filePath, folder = "social_media") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
      transformation: [
        { width: 1080, height: 1080, crop: "limit" },
        { quality: "auto:good", fetch_format: "auto" },
      ],
    });

    ensureCloudinaryResult(result, "Invalid Cloudinary image upload response");

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  } finally {
    await safeUnlink(filePath);
  }
};

export const uploadVideo = async (filePath, folder = "social_media") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "video",
      transformation: [
        { width: 720, height: 1280, crop: "limit" },
        { quality: "auto:good" },
      ],
      format: "mp4",
    });

    ensureCloudinaryResult(result, "Invalid Cloudinary video upload response");

    const thumbnailUrl = cloudinary.url(`${result.public_id}.jpg`, {
      resource_type: "video",
      transformation: [
        { start_offset: "1" },
        { width: 720, height: 1280, crop: "limit" },
        { quality: "auto:good", fetch_format: "auto" },
      ],
      secure: true,
    });

    return {
      video: {
        url: result.secure_url,
        public_id: result.public_id,
        duration: result.duration,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
      },
      thumbnail: {
        url: thumbnailUrl,
        public_id: `${result.public_id}.jpg`,
      },
    };
  } catch (error) {
    throw new Error(`Video upload failed: ${error.message}`);
  } finally {
    await safeUnlink(filePath);
  }
};

export const uploadStoryMedia = async (
  filePath,
  folder = "social_media/stories"
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
      transformation: [
        { width: 1080, height: 1920, crop: "fill", gravity: "auto" },
        { quality: "auto:eco", fetch_format: "auto" },
      ],
    });

    ensureCloudinaryResult(result, "Invalid Cloudinary story upload response");

    return {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
    };
  } catch (error) {
    throw new Error(`Story media upload failed: ${error.message}`);
  } finally {
    await safeUnlink(filePath);
  }
};

export const uploadChatMedia = async (
  filePath,
  folder = "social_media/chats"
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto:low", fetch_format: "auto" },
      ],
    });

    ensureCloudinaryResult(result, "Invalid Cloudinary chat media upload response");

    return {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
    };
  } catch (error) {
    throw new Error(`Chat media upload failed: ${error.message}`);
  } finally {
    await safeUnlink(filePath);
  }
};

export const getOptimizedUrl = (
  publicId,
  resourceType = "image",
  options = {}
) => {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    secure: true,
    transformation: [
      {
        quality: "auto:good",
        fetch_format: "auto",
        ...options,
      },
    ],
  });
};

export const deleteMedia = async (publicId, resourceType = "image") => {
  if (!publicId) {
    throw new Error("publicId is required");
  }

  return await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

export default cloudinary;