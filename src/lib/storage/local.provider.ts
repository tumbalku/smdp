import { StorageProvider } from "./storage.interface";
import * as fs from "fs/promises";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

export class LocalStorageProvider implements StorageProvider {
  private getBaseDir(): string {
    return path.resolve(process.env.LOCAL_STORAGE_PATH || "./storage");
  }

  async upload(
    file: Buffer,
    fileName: string,
    folder: string
  ): Promise<string> {
    const ext = path.extname(fileName);
    const sanitizedName = `${uuidv4()}${ext}`;
    const relativePath = path.join("uploads", folder, sanitizedName);
    const absolutePath = path.join(this.getBaseDir(), relativePath);

    // Ensure directory exists
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });

    // Write file
    await fs.writeFile(absolutePath, file);

    // Return relative path for database storage (normalized for all OS)
    return relativePath.replace(/\\/g, "/");
  }

  async getFileUrl(filePath: string): Promise<string> {
    // Return API endpoint path that will serve the file securely
    return `/api/documents/download?path=${encodeURIComponent(filePath)}`;
  }

  async delete(filePath: string): Promise<void> {
    const absolutePath = path.join(this.getBaseDir(), filePath);
    try {
      await fs.unlink(absolutePath);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
}
