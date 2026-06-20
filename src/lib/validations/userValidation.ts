import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  employeeId: z.string().trim().min(1, "NIP wajib diisi"),
  gender: z.enum(["L", "P"]).optional().nullable(),
  birthDate: z.string().optional().nullable(),
  roles: z.array(z.enum(["EMPLOYEE", "HR_ADMIN", "STAFF"])).min(1, "Pilih minimal satu peran"),
  employmentStatusId: z.string().optional().nullable(),
  employeeGroupId: z.string().optional().nullable(),
  professionGroupId: z.string().optional().nullable(),
  employeePositionId: z.string().optional().nullable(),
});

export const updateUserSchema = z.object({
  id: z.string().min(1, "ID pegawai wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi").optional(),
  email: z.string().email("Format email tidak valid").optional(),
  employeeId: z.string().trim().min(1, "NIP wajib diisi").optional().nullable(),
  gender: z.enum(["L", "P"]).optional().nullable(),
  birthDate: z.string().optional().nullable(),
  roles: z.array(z.enum(["EMPLOYEE", "HR_ADMIN", "STAFF"])).min(1, "Pilih minimal satu peran").optional(),
  employmentStatusId: z.string().optional().nullable(),
  employeeGroupId: z.string().optional().nullable(),
  professionGroupId: z.string().optional().nullable(),
  employeePositionId: z.string().optional().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
