/**
 * Contrato do adapter de storage de arquivos (Cloudinary, S3, etc.).
 */
export type UploadInput = {
  dataUrl: string;
  fileName: string;
  folder?: string;
};

export type UploadResult = {
  provider: string;
  publicId: string;
  url: string;
  secureUrl: string;
  fileName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
};

export interface StorageAdapter {
  upload(input: UploadInput): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
}
