import { StorageProvider } from "./storage.interface";
import { LocalStorageProvider } from "./local.provider";
import { SupabaseStorageProvider } from "./supabase.provider";
import { VercelBlobStorageProvider } from "./vercel-blob.provider";

export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || "local";
  switch (provider.toLowerCase()) {
    case "local":
      return new LocalStorageProvider();
    case "supabase":
      return new SupabaseStorageProvider();
    case "vercel-blob":
    case "vercelblob":
      return new VercelBlobStorageProvider();
    default:
      throw new Error(`STORAGE_PROVIDER tidak dikenali: ${provider}`);
  }
}

