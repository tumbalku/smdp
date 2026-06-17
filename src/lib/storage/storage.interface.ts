export interface StorageProvider {
  upload(file: Buffer, fileName: string, folder: string): Promise<string>;
  getFileUrl(filePath: string): Promise<string>;
  delete(filePath: string): Promise<void>;
}
