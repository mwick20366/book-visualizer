// src/server/storage/get-public-url.ts

export function getPublicUrl(
  key: string,
) {
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
