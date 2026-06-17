import { StorageProvider } from "./storage.interface";
import { LocalStorageProvider } from "./local.provider";

export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || "local";
  switch (provider.toLowerCase()) {
    case "local":
      return new LocalStorageProvider();
    default:
      throw new Error(`STORAGE_PROVIDER tidak dikenali: ${provider}`);
  }
}
