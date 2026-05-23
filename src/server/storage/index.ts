import { CloudinaryAdapter } from "./cloudinary-adapter";
import type { StorageAdapter } from "./types";

/**
 * Instância ativa do adapter de storage.
 * Para trocar de provider, substitua apenas esta linha.
 */
export const storage: StorageAdapter = new CloudinaryAdapter();

export type { StorageAdapter, UploadInput, UploadResult } from "./types";
