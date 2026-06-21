import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 0. Clear existing data
  console.log("🧹 Clearing existing database data...");
  await prisma.verificationHistory.deleteMany({});
  await prisma.documentRecord.deleteMany({});
  await prisma.documentType.deleteMany({});
  await prisma.securityLog.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.workplace.deleteMany({});
  await prisma.employeePosition.deleteMany({});
  await prisma.employeeRank.deleteMany({});
  await prisma.professionGroup.deleteMany({});
  await prisma.employeeGroup.deleteMany({});
  await prisma.employmentStatus.deleteMany({});
  console.log("🗑️ Existing data cleared.");

  // 1. Seed Document Types
  const documentTypes = [
    { name: "CV", isMandatory: false, requiresExpiryDate: false, description: "Curriculum Vitae", targetPositions: null, maxSize: 5, allowedFormats: "PDF, DOCX", icon: "FileText" },
    { name: "KTP", isMandatory: true, requiresExpiryDate: false, description: "National ID", targetPositions: null, maxSize: 2, allowedFormats: "JPG, PNG", icon: "CreditCard" },
    { name: "Ijazah", isMandatory: true, requiresExpiryDate: false, description: "Educational Certificate", targetPositions: null, maxSize: 5, allowedFormats: "PDF", icon: "GraduationCap" },
    { name: "STR Medis", isMandatory: true, requiresExpiryDate: true, description: "Surat Tanda Registrasi Medis", targetPositions: "Medis", maxSize: 5, allowedFormats: "PDF, JPG, PNG", icon: "HeartPulse" },
    { name: "SIP Medis", isMandatory: true, requiresExpiryDate: true, description: "Surat Izin Praktik Medis", targetPositions: "Medis", maxSize: 5, allowedFormats: "PDF, JPG, PNG", icon: "Award" },
    { name: "STR Keperawatan", isMandatory: true, requiresExpiryDate: true, description: "Surat Tanda Registrasi Keperawatan", targetPositions: "Keperawatan", maxSize: 5, allowedFormats: "PDF, JPG, PNG", icon: "HeartPulse" },
    { name: "SIP Keperawatan", isMandatory: true, requiresExpiryDate: true, description: "Surat Izin Praktik Keperawatan", targetPositions: "Keperawatan", maxSize: 5, allowedFormats: "PDF, JPG, PNG", icon: "Award" },
    { name: "STR Kebidanan", isMandatory: true, requiresExpiryDate: true, description: "Surat Tanda Registrasi Kebidanan", targetPositions: "Kebidanan", maxSize: 5, allowedFormats: "PDF, JPG, PNG", icon: "HeartPulse" },
    { name: "SIP Kebidanan", isMandatory: true, requiresExpiryDate: true, description: "Surat Izin Praktik Kebidanan", targetPositions: "Kebidanan", maxSize: 5, allowedFormats: "PDF, JPG, PNG", icon: "Award" },
    { name: "STR Kefarmasian", isMandatory: true, requiresExpiryDate: true, description: "Surat Tanda Registrasi Kefarmasian", targetPositions: "Kefarmasian", maxSize: 5, allowedFormats: "PDF, JPG, PNG", icon: "HeartPulse" },
    { name: "STR Penunjang Medis", isMandatory: true, requiresExpiryDate: true, description: "Surat Tanda Registrasi Penunjang Medis", targetPositions: "Penunjang Medis", maxSize: 5, allowedFormats: "PDF, JPG, PNG", icon: "HeartPulse" },
    { name: "Sertifikat", isMandatory: false, requiresExpiryDate: false, description: "Training Certificate", targetPositions: null, maxSize: 10, allowedFormats: "PDF, JPG, PNG", icon: "ShieldCheck" },
  ];

  for (const docType of documentTypes) {
    await prisma.documentType.create({
      data: docType,
    });
  }
  console.log("✅ Document types seeded successfully!");

  // 2. Seed Master Kepegawaian (Employment Taxonomy)
  const statuses = ["ASN", "Non ASN"];
  const statusMap: { [key: string]: string } = {};
  for (const sName of statuses) {
    const s = await prisma.employmentStatus.create({
      data: { name: sName },
    });
    statusMap[sName] = s.id;
  }

  const groups = [
    { name: "PNS", status: "ASN" },
    { name: "PPPK", status: "ASN" },
    { name: "BLUD Tetap", status: "Non ASN" },
    { name: "BLUD Kontrak", status: "Non ASN" },
  ];
  const groupMap: { [key: string]: string } = {};
  for (const g of groups) {
    const statusId = statusMap[g.status];
    const grp = await prisma.employeeGroup.create({
      data: {
        name: g.name,
        employmentStatusId: statusId,
      },
    });
    groupMap[`${g.status}_${g.name}`] = grp.id;
  }

  const profs = ["Medis", "Keperawatan", "Kebidanan", "Kefarmasian", "Administrasi"];
  const profMap: { [key: string]: string } = {};
  for (const pName of profs) {
    const p = await prisma.professionGroup.create({
      data: { name: pName },
    });
    profMap[pName] = p.id;
  }

  const positions = [
    { name: "Dokter Umum", group: "Medis" },
    { name: "Dokter Spesialis", group: "Medis" },
    { name: "Perawat Ahli Pertama", group: "Keperawatan" },
    { name: "Bidan Ahli Muda", group: "Kebidanan" },
    { name: "Apoteker", group: "Kefarmasian" },
    { name: "Pranata Komputer", group: "Administrasi" },
  ];
  const positionMap: { [key: string]: string } = {};
  for (const pos of positions) {
    const profGroupId = profMap[pos.group];
    const p = await prisma.employeePosition.create({
      data: {
        name: pos.name,
        professionGroupId: profGroupId,
      },
    });
    positionMap[`${pos.group}_${pos.name}`] = p.id;
  }
  console.log("✅ Master kepegawaian seeded successfully!");

  // 2b. Seed Master Pangkat (Employee Ranks)
  const ranks = [
    "Pembina Utama Muda (IV/c)",
    "Pembina (IV/a)",
    "Penata Tingkat I (III/d)",
    "Penata (III/c)",
    "Penata Muda Tingkat I (III/b)",
    "Penata Muda (III/a)",
    "Pengatur (II/c)",
  ];
  const rankMap: { [key: string]: string } = {};
  for (const rName of ranks) {
    const r = await prisma.employeeRank.create({
      data: { name: rName },
    });
    rankMap[rName] = r.id;
  }
  console.log("✅ Master pangkat seeded successfully!");

  // 2c. Seed Master Tempat Tugas (Workplaces)
  const workplacesData = [
    "Ruang ICCU",
    "Ruang ICU",
    "Ruang Isolasi",
    "Ruang Laika Mendidoha Lt.I (Kelas I)",
    "Ruang Lambu Barakati Lt.I",
  ];
  const workplaceMap: { [key: string]: string } = {};
  for (const wName of workplacesData) {
    const w = await prisma.workplace.create({
      data: { name: wName },
    });
    workplaceMap[wName] = w.id;
  }
  console.log("✅ Master tempat tugas seeded successfully!");


  // 3. Seed Users (Exactly 6 users: 2 PNS, 2 PPPK, 2 BLUD; 1 Admin, 1 Staff, 4 Employees)
  const passwordHashAdmin = await bcrypt.hash("admin123", 10);
  const passwordHashStaff = await bcrypt.hash("staff123", 10);
  const passwordHashDefault = await bcrypt.hash("pegawai123", 10);

  const users = [
    {
      email: "admin@smdp.local",
      name: "Budi Setiadi",
      passwordHash: passwordHashAdmin,
      role: Role.HR_ADMIN,
      employeeId: "198004122008031002", // PNS birth date: 1980-04-12, CPNS: 2008-03
      gender: "L",
      birthDate: new Date("1980-04-12"),
      employmentStatusName: "ASN",
      employeeGroupName: "PNS",
      professionGroupName: "Administrasi",
      employeePositionName: "Pranata Komputer",
      employeeRankName: "Pembina (IV/a)",
      workplaceName: "Ruang Lambu Barakati Lt.I",
      agama: "Islam",
      pendidikanTerakhir: "S2",
    },
    {
      email: "staff@smdp.local",
      name: "Siti Aminah",
      passwordHash: passwordHashStaff,
      role: Role.STAFF,
      employeeId: "198509202010122001", // PNS birth date: 1985-09-20, CPNS: 2010-12
      gender: "P",
      birthDate: new Date("1985-09-20"),
      employmentStatusName: "ASN",
      employeeGroupName: "PNS",
      professionGroupName: "Administrasi",
      employeePositionName: "Pranata Komputer",
      employeeRankName: "Penata Tingkat I (III/d)",
      workplaceName: "Ruang Lambu Barakati Lt.I",
      agama: "Islam",
      pendidikanTerakhir: "D4 / S1",
    },
    {
      email: "pppk1@smdp.local",
      name: "Hendra Wijaya",
      passwordHash: passwordHashDefault,
      role: Role.EMPLOYEE,
      employeeId: "199011152020081003",
      gender: "L",
      birthDate: new Date("1990-11-15"),
      employmentStatusName: "ASN",
      employeeGroupName: "PNS",
      professionGroupName: "Keperawatan",
      employeePositionName: "Perawat Ahli Pertama",
      employeeRankName: "Penata Muda (III/a)",
      workplaceName: "Ruang ICCU",
      agama: "Kristen Protestan",
      pendidikanTerakhir: "D4 / S1",
    },
    {
      email: "pppk2@smdp.local",
      name: "Rina Melati",
      passwordHash: passwordHashDefault,
      role: Role.EMPLOYEE,
      employeeId: "199503252021102004",
      gender: "P",
      birthDate: new Date("1995-03-25"),
      employmentStatusName: "ASN",
      employeeGroupName: "PPPK",
      professionGroupName: "Administrasi",
      employeePositionName: "Pranata Komputer",
      employeeRankName: "Penata Muda (III/a)",
      workplaceName: "Ruang ICU",
      agama: "Islam",
      pendidikanTerakhir: "D3",
    },
    {
      email: "blud1@smdp.local",
      name: "Ahmad Fauzi",
      passwordHash: passwordHashDefault,
      role: Role.EMPLOYEE,
      employeeId: "199207052018001005",
      gender: "L",
      birthDate: new Date("1992-07-05"),
      employmentStatusName: "Non ASN",
      employeeGroupName: "BLUD Tetap",
      professionGroupName: "Medis",
      employeePositionName: "Dokter Umum",
      employeeRankName: null,
      workplaceName: "Ruang Isolasi",
      agama: "Islam",
      pendidikanTerakhir: "Sp-1",
    },
    {
      email: "blud2@smdp.local",
      name: "Dewi Lestari",
      passwordHash: passwordHashDefault,
      role: Role.EMPLOYEE,
      employeeId: "199712012022002006",
      gender: "P",
      birthDate: new Date("1997-12-01"),
      employmentStatusName: "Non ASN",
      employeeGroupName: "BLUD Kontrak",
      professionGroupName: "Kebidanan",
      employeePositionName: "Bidan Ahli Muda",
      employeeRankName: null,
      workplaceName: "Ruang Laika Mendidoha Lt.I (Kelas I)",
      agama: "Hindu",
      pendidikanTerakhir: "D3",
    },
  ];

  for (const user of users) {
    let employmentStatusId: string | null = null;
    let employeeGroupId: string | null = null;
    let professionGroupId: string | null = null;
    let employeePositionId: string | null = null;
    let employeeRankId: string | null = null;
    let workplaceId: string | null = null;

    if (user.employmentStatusName) {
      employmentStatusId = statusMap[user.employmentStatusName] || null;
      if (user.employeeGroupName) {
        employeeGroupId = groupMap[`${user.employmentStatusName}_${user.employeeGroupName}`] || null;
      }
    }
    if (user.professionGroupName) {
      professionGroupId = profMap[user.professionGroupName] || null;
      if (user.employeePositionName) {
        employeePositionId = positionMap[`${user.professionGroupName}_${user.employeePositionName}`] || null;
      }
    }
    if (user.employeeRankName) {
      employeeRankId = rankMap[user.employeeRankName] || null;
    }
    if (user.workplaceName) {
      workplaceId = workplaceMap[user.workplaceName] || null;
    }

    const dbUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
        employeeId: user.employeeId,
        gender: user.gender,
        birthDate: user.birthDate,
        employmentStatusId,
        employeeGroupId,
        professionGroupId,
        employeePositionId,
        employeeRankId,
        workplaceId,
        agama: user.agama,
        pendidikanTerakhir: user.pendidikanTerakhir,
      },
    });

    await prisma.userRole.create({
      data: {
        userId: dbUser.id,
        role: dbUser.role,
      },
    });
  }
  console.log("✅ Exactly 6 users seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
