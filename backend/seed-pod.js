const { PrismaClient } = require('@prisma/client');

async function seedPod() {
  const prisma = new PrismaClient();
  try {
    const doc = await prisma.document.create({
      data: {
        shipmentId: '32483de9-14ce-4b77-8594-b9e3ab758815',
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        type: 'POD_PHOTO'
      }
    });
    console.log('POD seeded successfully:', doc);
  } catch (error) {
    console.error('Error seeding POD:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPod();
