import { StorageProvider } from "./storage.interface";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";

export class VercelBlobStorageProvider implements StorageProvider {
  private getToken(): string {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error(
        "Konfigurasi Vercel Blob tidak lengkap. Pastikan BLOB_READ_WRITE_TOKEN diatur di .env"
      );
    }
    return token;
  }

  async upload(
    file: Buffer,
    fileName: string,
    folder: string
  ): Promise<string> {
    const token = this.getToken();
    const ext = path.extname(fileName);
    const sanitizedName = `${uuidv4()}${ext}`;
    const pathName = `${folder}/${sanitizedName}`;

    const uploadUrl = `https://blob.vercel-storage.com/${pathName}`;

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-version": "1",
        "x-add-random-suffix": "0", // We generate a unique UUID filename, so no extra suffix is needed
      },
      body: new Uint8Array(file),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal mengunggah berkas ke Vercel Blob: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error("Respon Vercel Blob tidak mengandung URL berkas.");
    }

    return data.url;
  }

  async getFileUrl(filePath: string): Promise<string> {
    // filePath is stored as the full public URL, so we return it directly
    return filePath;
  }

  async delete(filePath: string): Promise<void> {
    const token = this.getToken();

    const deleteUrl = "https://blob.vercel-storage.com/delete";

    try {
      const response = await fetch(deleteUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-version": "1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urls: [filePath],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gagal menghapus berkas dari Vercel Blob: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error("Gagal menghapus berkas dari Vercel Blob:", error);
    }
  }
}
