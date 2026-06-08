// src/server/storage/download-file.ts

import {
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { s3 } from "./s3";

export async function downloadFile(
  key: string,
): Promise<Buffer> {
  const response =
    await s3.send(
      new GetObjectCommand({
        Bucket:
          process.env.AWS_S3_BUCKET_NAME,

        Key: key,
      }),
    );

  if (!response.Body) {
    throw new Error(
      `No file found for key: ${key}`,
    );
  }

  const bytes =
    await response.Body.transformToByteArray();

  return Buffer.from(bytes);
}