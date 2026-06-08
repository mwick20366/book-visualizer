// src/server/storage/upload-file.ts

import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { s3 } from "./s3";

export async function uploadFile({
  key,
  body,
  contentType,
}: {
  key: string;

  body: Buffer;

  contentType: string;
}) {
  await s3.send(
    new PutObjectCommand({
      Bucket:
        process.env.AWS_S3_BUCKET_NAME,

      Key: key,

      Body: body,

      ContentType:
        contentType,
    }),
  );

  return key;
}