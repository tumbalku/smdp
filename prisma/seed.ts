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
  await prisma.employeePosition.deleteMany({});
  await prisma.employeeGroup.deleteMany({});
  await prisma.employmentStatus.deleteMany({});
  console.log("🗑️ Existing data cleared.");

  // 1. Seed Document Types
  const documentTypes = [
    { name: "CV", isMandatory: false, requiresExpiryDate: false, description: "Curriculum Vitae", targetPositions: null, maxSize: 5, allowedFormats: "PDF, DOCX" },
    { name: "KTP", isMandatory: true, requiresExpiryDate: false, description: "National ID", targetPositions: null, maxSize: 2, allowedFormats: "JPG, PNG" },
    { name: "Ijazah", isMandatory: true, requiresExpiryDate: false, description: "Educational Certificate", targetPositions: null, maxSize: 5, allowedFormats: "PDF" },
    { name: "STR Medis", isMandatory: true, requiresExpiryDate: true, description: "Surat Tanda Registrasi Medis", targetPositions: "Medis", maxSize: 5, allowedFormats: "PDF, JPG, PNG" },
    { name: "SIP Medis", isMandatory: true, requiresExpiryDate: true, description: "Surat Izin Praktik Medis", targetPositions: "Medis", maxSize: 5, allowedFormats: "PDF, JPG, PNG" },
    { name: "STR Keperawatan", isMandatory: true, requiresExpiryDate: true, description: "Surat Tanda Registrasi Keperawatan", targetPositions: "Keperawatan", maxSize: 5, allowedFormats: "PDF, JPG, PNG" },
    { name: "SIP Keperawatan", isMandatory: true, requiresExpiryDate: true, description: "Surat Izin Praktik Keperawatan", targetPositions: "Keperawatan", maxSize: 5, allowedFormats: "PDF, JPG, PNG" },
    { name: "STR Kebidanan", isMandatory: true, requiresExpiryDate: true, description: "Surat Tanda Registrasi Kebidanan", targetPositions: "Kebidanan", maxSize: 5, allowedFormats: "PDF, JPG, PNG" },
    { name: "SIP Kebidanan", isMandatory: true, requiresExpiryDate: true, description: "Surat Izin Praktik Kebidanan", targetPositions: "Kebidanan", maxSize: 5, allowedFormats: "PDF, JPG, PNG" },
    { name: "STR Kefarmasian", isMandatory: true, requiresExpiryDate: true, description: "Surat Tanda Registrasi Kefarmasian", targetPositions: "Kefarmasian", maxSize: 5, allowedFormats: "PDF, JPG, PNG" },
    { name: "STR Penunjang Medis", isMandatory: true, requiresExpiryDate: true, description: "Surat Tanda Registrasi Penunjang Medis", targetPositions: "Penunjang Medis", maxSize: 5, allowedFormats: "PDF, JPG, PNG" },
    { name: "Sertifikat", isMandatory: false, requiresExpiryDate: false, description: "Training Certificate", targetPositions: null, maxSize: 10, allowedFormats: "PDF, JPG, PNG" },
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
    { name: "BLUD", status: "Non ASN" },
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

  const positions = [
    { name: "Medis", group: "PNS", status: "ASN" },
    { name: "Keperawatan", group: "PNS", status: "ASN" },
    { name: "Kebidanan", group: "PNS", status: "ASN" },
    { name: "Kefarmasian", group: "PNS", status: "ASN" },
    { name: "Penunjang Medis", group: "PNS", status: "ASN" },
    { name: "Administrasi", group: "PNS", status: "ASN" },
    { name: "Teknologi Informasi", group: "PNS", status: "ASN" },
    { name: "Manajemen", group: "PNS", status: "ASN" },
    { name: "Full Time", group: "PPPK", status: "ASN" },
    { name: "Part Time", group: "PPPK", status: "ASN" },
  ];
  const positionMap: { [key: string]: string } = {};
  for (const pos of positions) {
    const groupId = groupMap[`${pos.status}_${pos.group}`];
    const p = await prisma.employeePosition.create({
      data: {
        name: pos.name,
        employeeGroupId: groupId,
      },
    });
    positionMap[`${pos.status}_${pos.group}_${pos.name}`] = p.id;
  }
  console.log("✅ Master kepegawaian seeded successfully!");

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
      employeePositionName: "Administrasi",
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
      employeePositionName: "Administrasi",
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
      employeePositionName: "Keperawatan",
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
      employeePositionName: "Part Time",
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
      employeeGroupName: "BLUD",
      employeePositionName: undefined,
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
      employeeGroupName: "BLUD",
      employeePositionName: undefined,
    },
  ];

  for (const user of users) {
    let employmentStatusId: string | null = null;
    let employeeGroupId: string | null = null;
    let employeePositionId: string | null = null;

    if (user.employmentStatusName) {
      employmentStatusId = statusMap[user.employmentStatusName] || null;
      if (user.employeeGroupName) {
        employeeGroupId = groupMap[`${user.employmentStatusName}_${user.employeeGroupName}`] || null;
        if (user.employeePositionName) {
          employeePositionId = positionMap[`${user.employmentStatusName}_${user.employeeGroupName}_${user.employeePositionName}`] || null;
        }
      }
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
        employeePositionId,
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
