import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "eu-west-2",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "product-catalog-images";

export const generateUploadUrl = async (
  fileName: string,
  fileType: string
): Promise<{ uploadUrl: string; fileUrl: string }> => {
  const key = `products/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  const fileUrl = `https://${BUCKET_NAME}.s3.${
    process.env.S3_REGION || "eu-west-2"
  }.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl };
};

export const isValidImageType = (contentType: string): boolean => {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return validTypes.includes(contentType.toLowerCase());
};

export const getFileExtension = (contentType: string): string => {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  return extensions[contentType.toLowerCase()] || "jpg";
};
