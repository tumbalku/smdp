export interface UserProfile {
  name: string;
  email: string;
  employeeId: string | null;
  role: string;
  namaLahir: string | null;
  alamatLengkap: string | null;
  nomorTelepon: string | null;
  gelarAkademik: string | null;
  gender: string | null;
  birthDate: string | null;
  agama: string | null;
  pendidikanTerakhir: string | null;
  statusPernikahan: string | null;
  createdAt: string;
  employmentStatus: { name: string } | null;
  employeeGroup: { name: string } | null;
  professionGroup: { name: string } | null;
  employeePosition: { name: string } | null;
  employeeRank: { name: string } | null;
  workplace: { name: string } | null;
}

export interface NipDetails {
  birthDate: Date | null;
  cpnsDate: Date;
  yearsActive: number;
  monthsActive: number;
  retirementDate: Date | null;
  yearsToRetire: number;
  monthsToRetire: number;
  hasRetired: boolean;
  isNipValid: boolean;
}
