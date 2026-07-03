const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function wipeShipments() {
  try {
    const deletedDocs = await prisma.document.deleteMany({});
    console.log(`Successfully deleted ${deletedDocs.count} documents.`);
    
    const deleted = await prisma.shipment.deleteMany({});
    console.log(`Successfully deleted ${deleted.count} shipments.`);
  } catch (error) {
    console.error("Error wiping shipments:", error);
  } finally {
    await prisma.$disconnect();
  }
}

wipeShipments();
