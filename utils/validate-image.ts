import { fileTypeFromBuffer } from "file-type";

const allowedMimeTypes: Array<string> = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

interface Config {
  maxFileSize: number; // Max File Size in MB
}
/**
 * Validation Function to ensure Images are valid
 * @returns {boolean} Success state of the validation. True = Valid; False = Invalid
 * @param {File} image Image File to validate
 * @param {Config} config Validation config
 */
const validateImage = async (
  image: File,
  config?: Config
): Promise<{ status: boolean; message: string }> => {
  try {
    // Ensure image is File instance
    if (!image || !(image instanceof File)) {
      return {
        message: "Invalid Image!",
        status: false,
      };
    }

    // Ensure Valid Mime Type
    const image_ArrayBuffer = await image.arrayBuffer();
    const image_MimeType = await fileTypeFromBuffer(image_ArrayBuffer);

    if (!image_MimeType || !allowedMimeTypes.includes(image_MimeType.mime)) {
      return {
        message: "Image type not supported!",
        status: false,
      };
    }

    // Ensure proper file size. Default size is 4MB
    const MAX_FILE_SIZE = config?.maxFileSize || 4 * 1024 * 1024;
    if (image.size > MAX_FILE_SIZE) {
      return {
        message: "Image is too large!",
        status: false,
      };
    }

    return {
      message: "Valid",
      status: true,
    };
  } catch (error) {
    throw error;
  }
};

export default validateImage;
