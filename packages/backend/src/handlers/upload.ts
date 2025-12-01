import { APIGatewayProxyHandler } from 'aws-lambda';
import { withDatabase, parseBody, successResponse, errorResponse } from '../utils/handler';
import { generateUploadUrl, isValidImageType } from '../utils/s3';

interface UploadUrlRequest {
  fileName: string;
  fileType: string;
}

export const getUploadUrl: APIGatewayProxyHandler = withDatabase(
  async (event) => {
    try {
      console.log('S3 Configuration:', {
        bucket: process.env.S3_BUCKET_NAME,
        region: process.env.S3_REGION,
        hasAccessKey: !!process.env.S3_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.S3_SECRET_ACCESS_KEY,
      });

      const { fileName, fileType } = parseBody<UploadUrlRequest>(event);

      if (!fileName || !fileType) {
        return errorResponse('fileName and fileType are required');
      }

      if (!isValidImageType(fileType)) {
        return errorResponse('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      }

      const { uploadUrl, fileUrl } = await generateUploadUrl(fileName, fileType);

      return successResponse({
        uploadUrl,
        fileUrl,
      });
    } catch (error) {
      console.error('Upload URL generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate upload URL';
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return errorResponse(errorMessage, 500);
    }
  }
);
