import { z } from "zod";

export const documentTypeSchema = z.object({
  name: z.string().min(1, "Nama dokumen wajib diisi"),
  description: z.string().optional().nullable(),
  targetPositions: z.string().optional().nullable(),
  isMandatory: z.boolean().default(false),
  requiresExpiryDate: z.boolean().default(false),
  maxSize: z.number().min(1, "Batas ukuran minimal 1MB").default(5),
  allowedFormats: z.string().default("PDF, JPG, PNG"),
});

export const documentTypeUpdateArraySchema = z.array(
  documentTypeSchema.extend({
    id: z.string().min(1, "ID wajib diisi"),
  })
);

export type DocumentTypeInput = z.infer<typeof documentTypeSchema>;
