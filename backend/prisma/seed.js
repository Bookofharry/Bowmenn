const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

// Dev-only defaults. In production every password must come from env.
const DEFAULT_PASSWORDS = {
  admin: "Admin1234!",
  customer: "Test1234!",
  driver: "Driver1234!",
};

const passwords = {
  admin: process.env.SEED_ADMIN_PASSWORD || DEFAULT_PASSWORDS.admin,
  customer: process.env.SEED_CUSTOMER_PASSWORD || DEFAULT_PASSWORDS.customer,
  driver: process.env.SEED_DRIVER_PASSWORD || DEFAULT_PASSWORDS.driver,
};

if (process.env.NODE_ENV === "production") {
  const usingDefaults = Object.keys(passwords).filter((k) => passwords[k] === DEFAULT_PASSWORDS[k]);
  if (usingDefaults.length > 0) {
    console.error(
      `Refusing to seed production with default passwords for: ${usingDefaults.join(", ")}. ` +
        "Set SEED_ADMIN_PASSWORD, SEED_CUSTOMER_PASSWORD, and SEED_DRIVER_PASSWORD."
    );
    process.exit(1);
  }
}

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
    password: passwords.admin,
    name: "Bowmenn Admin",
    role: "ADMIN",
  });

  const customer = await upsertUser({
    email: "testcustomer@bowmenn.com",
    password: passwords.customer,
    name: "Test Customer",
    phone: "+2348000000001",
    role: "CUSTOMER",
  });

  const driver = await upsertUser({
    email: "driver1@bowmenn.com",
    password: passwords.driver,
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
  console.log(`- Admin: ${admin.email}`);
  console.log(`- Customer: ${customer.email}`);
  console.log(`- Driver: ${driver.email}`);
}

main()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
