import { StorageProvider } from "./storage.interface";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";

export class SupabaseStorageProvider implements StorageProvider {
  private getConfig() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Konfigurasi Supabase tidak lengkap. Pastikan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY diatur di .env"
      );
    }

    return {
      supabaseUrl: supabaseUrl.replace(/\/$/, ""),
      supabaseKey,
      bucket,
    };
  }

  private getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
      case ".pdf":
        return "application/pdf";
      case ".png":
        return "image/png";
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".doc":
        return "application/msword";
      case ".docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case ".xls":
        return "application/vnd.ms-excel";
      case ".xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case ".zip":
        return "application/zip";
      default:
        return "application/octet-stream";
    }
  }

  async upload(
    file: Buffer,
    fileName: string,
    folder: string
  ): Promise<string> {
    const { supabaseUrl, supabaseKey, bucket } = this.getConfig();
    const ext = path.extname(fileName);
    const sanitizedName = `${uuidv4()}${ext}`;
    const pathInBucket = `${folder}/${sanitizedName}`;

    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${pathInBucket}`;
    const contentType = this.getContentType(fileName);

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        "Content-Type": contentType,
      },
      body: new Uint8Array(file),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal mengunggah berkas ke Supabase: ${response.statusText} - ${errorText}`);
    }

    // Return the public URL of the uploaded object
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${pathInBucket}`;
  }

  async getFileUrl(filePath: string): Promise<string> {
    // If filePath is already a public URL, we return it as is
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    // Fallback if relative path is stored
    const { supabaseUrl, bucket } = this.getConfig();
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
  }

  async delete(filePath: string): Promise<void> {
    const { supabaseUrl, supabaseKey, bucket } = this.getConfig();

    // Extract pathInBucket from full public URL if necessary
    const searchString = `/storage/v1/object/public/${bucket}/`;
    const index = filePath.indexOf(searchString);
    const pathInBucket = index !== -1 ? filePath.substring(index + searchString.length) : filePath;

    const deleteUrl = `${supabaseUrl}/storage/v1/object/${bucket}`;

    try {
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prefixes: [pathInBucket],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gagal menghapus berkas dari Supabase: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error("Gagal menghapus berkas dari Supabase:", error);
    }
  }
}
