import { v2 as cloudinary } from "cloudinary";

import { env } from "~/env";

import type { StorageAdapter, UploadInput, UploadResult } from "./types";

const DEFAULT_FOLDER = "steandkath/pendencies";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Implementação do StorageAdapter usando Cloudinary.
 */
export class CloudinaryAdapter implements StorageAdapter {
  /**
   * Faz upload de uma imagem a partir de data URL base64.
   */
  async upload(input: UploadInput): Promise<UploadResult> {
    const result = await cloudinary.uploader.upload(input.dataUrl, {
      folder: input.folder ?? DEFAULT_FOLDER,
      public_id: this.buildPublicId(input.fileName),
      resource_type: "image",
      overwrite: false,
    });

    return {
      provider: "cloudinary",
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      fileName: input.fileName,
      mimeType: `image/${result.format}`,
      size: result.bytes,
      width: result.width,
      height: result.height,
    };
  }

  /**
   * Remove um recurso do Cloudinary pelo publicId.
   */
  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  }

  private buildPublicId(fileName: string): string {
    const base = fileName.replace(/\.[^.]+$/, "");
    const safe = base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `${safe}-${Date.now()}`;
  }
}
