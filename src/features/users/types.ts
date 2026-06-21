export interface EmployeeGroupOption {
  id: string;
  name: string;
}

export interface EmployeeRankOption {
  id: string;
  name: string;
}

export interface WorkplaceOption {
  id: string;
  name: string;
}

export interface EmploymentStatusOption {
  id: string;
  name: string;
  groups: EmployeeGroupOption[];
}

export interface EmployeePositionOption {
  id: string;
  name: string;
}

export interface ProfessionGroupOption {
  id: string;
  name: string;
  positions: EmployeePositionOption[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
  role: string;
  roles: string[];
  createdAt: string;
  namaLahir: string | null;
  alamatLengkap: string | null;
  nomorTelepon: string | null;
  gelarAkademik: string | null;
  gender: string | null;
  birthDate: string | null;
  employmentStatusId: string | null;
  employeeGroupId: string | null;
  professionGroupId: string | null;
  employeePositionId: string | null;
  employeeRankId: string | null;
  workplaceId: string | null;
  agama: string | null;
  pendidikanTerakhir: string | null;
  statusPernikahan: string | null;
  employmentStatus: { name: string } | null;
  employeeGroup: { name: string } | null;
  professionGroup: { name: string } | null;
  employeePosition: { name: string } | null;
  employeeRank: { name: string } | null;
  workplace: { name: string } | null;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  employeeId: string;
  gender: string;
  birthDate: string | null;
  roles: string[];
  employmentStatusId: string | null;
  employeeGroupId: string | null;
  professionGroupId: string | null;
  employeePositionId: string | null;
  employeeRankId: string | null;
  workplaceId: string | null;
  agama: string | null;
  pendidikanTerakhir: string | null;
  statusPernikahan: string | null;
}
