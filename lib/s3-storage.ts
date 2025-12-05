import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ConversationData {
  conversationId: string;
  startTime: string;
  lastUpdated: string;
  messages: ConversationMessage[];
  metadata?: Record<string, any>;
}

export async function uploadConversationToS3(
  conversationData: ConversationData
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }
  
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials are not configured');
  }

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  const filename = `${conversationData.conversationId}_${dateStr}.json`;
  const key = `conversations/${filename}`;
  const jsonContent = JSON.stringify(conversationData, null, 2);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: jsonContent,
    ContentType: 'application/json',
    Metadata: {
      conversationId: conversationData.conversationId,
      lastUpdated: conversationData.lastUpdated,
    },
  });

  await s3Client.send(command);
  return key;
}

export function generateConversationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `conv_${timestamp}_${random}`;
}

export function generateDocumentId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `doc_${timestamp}_${random}`;
}

export async function uploadDocumentToS3(
  file: Buffer,
  filename: string,
  contentType: string,
  folder: 'cvs' | 'job-descriptions' = 'cvs'
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }
  
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials are not configured');
  }

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  const documentId = generateDocumentId();
  const fileExtension = filename.split('.').pop();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folder}/${documentId}_${sanitizedFilename}_${dateStr}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
    Metadata: {
      originalFilename: filename,
      uploadDate: dateStr,
      documentId: documentId,
    },
  });

  await s3Client.send(command);
  return key;
}

/**
 * Download a file from S3
 * @param key - The S3 object key (path)
 * @returns Buffer containing the file data
 */
export async function getObjectFromS3(key: string): Promise<Buffer> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }
  
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials are not configured');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);
  
  if (!response.Body) {
    throw new Error('No data received from S3');
  }

  // Convert the readable stream to a buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}
