import { v2 as cloudinary } from "cloudinary";
import prisma from "../utils/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "bowmenn/pod"
): Promise<string> {
  // Mock upload for MVP if cloudinary is not properly configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === "your-cloud-name") {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return "https://images.unsplash.com/photo-1617997455403-41f35e46efbd?w=800&q=80"; // Real-looking package delivery photo
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

export async function savePOD(shipmentId: string, url: string, type: string) {
  // Verify shipment exists
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) throw Object.assign(new Error("Shipment not found"), { statusCode: 404 });

  return prisma.document.create({
    data: {
      shipmentId,
      url,
      type,
    },
  });
}
