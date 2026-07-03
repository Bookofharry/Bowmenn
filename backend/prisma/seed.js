const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function upsertUser({ email, password, name, phone = null, role }) {
  const passwordHash = await hashPassword(password);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      phone,
      role,
      passwordHash,
    },
    create: {
      email,
      name,
      phone,
      role,
      passwordHash,
    },
  });
}

async function main() {
  const admin = await upsertUser({
    email: "admin@bowmenn.com",
    password: "Admin1234!",
    name: "Bowmenn Admin",
    role: "ADMIN",
  });

  const customer = await upsertUser({
    email: "testcustomer@bowmenn.com",
    password: "Test1234!",
    name: "Test Customer",
    phone: "+2348000000001",
    role: "CUSTOMER",
  });

  const driver = await upsertUser({
    email: "driver1@bowmenn.com",
    password: "Driver1234!",
    name: "Driver One",
    phone: "+2348000000002",
    role: "DRIVER",
  });

  await prisma.driverProfile.upsert({
    where: { userId: driver.id },
    update: {
      vehicleType: "TRUCK",
      licenseNumber: "LAG-123456",
      isAvailable: true,
    },
    create: {
      userId: driver.id,
      vehicleType: "TRUCK",
      licenseNumber: "LAG-123456",
      isAvailable: true,
    },
  });

  console.log("Seeded test accounts:");
  console.log(`- Admin: ${admin.email} / Admin1234!`);
  console.log(`- Customer: ${customer.email} / Test1234!`);
  console.log(`- Driver: ${driver.email} / Driver1234!`);
}

main()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
