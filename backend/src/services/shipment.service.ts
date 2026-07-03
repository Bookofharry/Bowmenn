import prisma from "../utils/prisma";
import { ShipmentStatus } from "@prisma/client";

// ───────── Helpers ─────────

async function getDriverProfileId(userId: string): Promise<string | null> {
  const profile = await prisma.driverProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id || null;
}

// ───────── Customer Operations ─────────

interface CreateShipmentData {
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  cargoDetails: string;
  cargoWeight: number;
  truckType: string;
  price: number;
  quoteExpiresAt?: Date;
  distanceKm?: number;
  estimatedTimeMins?: number;
}

export async function createShipment(customerId: string, data: CreateShipmentData) {
  // Generate 4-digit codes
  const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
  const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

  return prisma.shipment.create({
    data: {
      customerId,
      pickupAddress: data.pickupAddress,
      dropoffAddress: data.dropoffAddress,
      pickupLat: data.pickupLat || 0,
      pickupLng: data.pickupLng || 0,
      dropoffLat: data.dropoffLat || 0,
      dropoffLng: data.dropoffLng || 0,
      cargoDetails: data.cargoDetails,
      cargoWeight: data.cargoWeight,
      truckType: data.truckType,
      price: data.price || 0,
      quoteExpiresAt: data.quoteExpiresAt,
      distanceKm: data.distanceKm,
      estimatedTimeMins: data.estimatedTimeMins,
      pickupCode,
      deliveryCode,
      status: "CONFIRMED",
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getCustomerShipments(customerId: string) {
  return prisma.shipment.findMany({
    where: { customerId },
    include: {
      driver: { select: { id: true, vehicleType: true, user: { select: { name: true, phone: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ───────── Shared ─────────

export async function getShipmentById(id: string, userId: string, role: string) {
  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      driver: {
        select: {
          id: true,
          vehicleType: true,
          licenseNumber: true,
          user: { select: { id: true, name: true, phone: true } },
        },
      },
      documents: true,
    },
  });

  if (!shipment) return null;

  // Admin can see everything
  if (role === "ADMIN") return shipment;

  // Customer can only see their own
  if (role === "CUSTOMER" && shipment.customerId === userId) return shipment;

  // Driver can only see shipments assigned to them
  if (role === "DRIVER") {
    const profileId = await getDriverProfileId(userId);
    if (profileId && shipment.driverId === profileId) return shipment;
    // Drivers can also view CONFIRMED shipments (available jobs)
    if (shipment.status === "CONFIRMED") return shipment;
  }

  return null; // Unauthorized
}

// ───────── Driver Operations ─────────

export async function getAvailableShipments() {
  return prisma.shipment.findMany({
    where: { status: "CONFIRMED", driverId: null },
    include: {
      customer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDriverShipments(userId: string) {
  const profileId = await getDriverProfileId(userId);
  if (!profileId) throw Object.assign(new Error("Driver profile not found"), { statusCode: 404 });

  return prisma.shipment.findMany({
    where: { driverId: profileId },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      documents: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function acceptShipment(shipmentId: string, userId: string) {
  const profileId = await getDriverProfileId(userId);
  if (!profileId) throw Object.assign(new Error("Driver profile not found"), { statusCode: 404 });

  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) throw Object.assign(new Error("Shipment not found"), { statusCode: 404 });
  
  if (shipment.status !== "CONFIRMED" || (shipment.driverId && shipment.driverId !== profileId)) {
    throw Object.assign(new Error("Shipment is not available for acceptance"), { statusCode: 400 });
  }

  return prisma.shipment.update({
    where: { id: shipmentId },
    data: { driverId: profileId, status: "ASSIGNED" },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      driver: { select: { id: true, vehicleType: true, user: { select: { name: true } } } },
    },
  });
}

export async function rejectShipment(shipmentId: string, userId: string) {
  const profileId = await getDriverProfileId(userId);
  if (!profileId) throw Object.assign(new Error("Driver profile not found"), { statusCode: 404 });

  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) throw Object.assign(new Error("Shipment not found"), { statusCode: 404 });
  if (shipment.status !== "ASSIGNED" || shipment.driverId !== profileId) {
    throw Object.assign(new Error("Cannot reject: shipment not assigned to you"), { statusCode: 400 });
  }

  return prisma.shipment.update({
    where: { id: shipmentId },
    data: { driverId: null, status: "CONFIRMED" },
  });
}

// ───────── Status Transitions ─────────

const DRIVER_TRANSITIONS: Record<string, ShipmentStatus> = {
  "ASSIGNED": "PICKED_UP",
  "PICKED_UP": "IN_TRANSIT",
  "IN_TRANSIT": "DELIVERED",
  "DELIVERED": "COMPLETED",
};

export async function updateShipmentStatus(
  shipmentId: string,
  userId: string,
  role: string,
  newStatus: ShipmentStatus,
  code?: string
) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { documents: true },
  });
  if (!shipment) throw Object.assign(new Error("Shipment not found"), { statusCode: 404 });

  // ADMIN override: DELIVERED → COMPLETED
  if (role === "ADMIN") {
    if (newStatus === "COMPLETED" && shipment.status === "DELIVERED") {
      return prisma.shipment.update({
        where: { id: shipmentId },
        data: { status: "COMPLETED" },
      });
    }
    // Admin can also force any valid transition
    return prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: newStatus },
    });
  }

  // DRIVER transitions
  if (role === "DRIVER") {
    const profileId = await getDriverProfileId(userId);
    if (!profileId || shipment.driverId !== profileId) {
      throw Object.assign(new Error("Shipment not assigned to you"), { statusCode: 403 });
    }

    const expectedNext = DRIVER_TRANSITIONS[shipment.status];
    if (!expectedNext || expectedNext !== newStatus) {
      throw Object.assign(
        new Error(`Invalid transition: cannot go from ${shipment.status} to ${newStatus}`),
        { statusCode: 400 }
      );
    }

    // ASSIGNED → PICKED_UP requires pickupCode
    if (newStatus === "PICKED_UP" && shipment.pickupCode) {
      if (!code || code !== shipment.pickupCode) {
        throw Object.assign(new Error("Invalid Pickup Code. Please ask the shipper for the 4-digit code."), { statusCode: 400 });
      }
    }

    // IN_TRANSIT → DELIVERED requires POD
    if (shipment.status === "IN_TRANSIT" && newStatus === "DELIVERED") {
      if (shipment.documents.length === 0) {
        throw Object.assign(
          new Error("Cannot mark as DELIVERED without uploading Proof of Delivery"),
          { statusCode: 400 }
        );
      }
    }

    // DELIVERED → COMPLETED requires deliveryCode
    if (newStatus === "COMPLETED" && shipment.deliveryCode) {
      if (!code || code !== shipment.deliveryCode) {
        throw Object.assign(new Error("Invalid Delivery Code. Please ask the receiver for the 4-digit code."), { statusCode: 400 });
      }
    }

    return prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: newStatus },
      include: {
        customer: { select: { id: true, name: true } },
        driver: { select: { id: true, user: { select: { name: true } } } },
      },
    });
  }

  throw Object.assign(new Error("Customers cannot update shipment status"), { statusCode: 403 });
}

// ───────── Admin Operations ─────────

export async function getAllShipments() {
  return prisma.shipment.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      driver: { select: { id: true, vehicleType: true, user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminAssignDriver(shipmentId: string, driverId: string) {
  // Verify driver profile exists
  const driverProfile = await prisma.driverProfile.findUnique({ where: { id: driverId } });
  if (!driverProfile) throw Object.assign(new Error("Driver profile not found"), { statusCode: 404 });

  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) throw Object.assign(new Error("Shipment not found"), { statusCode: 404 });

  return prisma.shipment.update({
    where: { id: shipmentId },
    data: { driverId, status: "CONFIRMED" },
    include: {
      customer: { select: { id: true, name: true } },
      driver: { select: { id: true, vehicleType: true, user: { select: { name: true } } } },
    },
  });
}

// ───────── Documents ─────────

export async function getShipmentDocuments(shipmentId: string) {
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) throw Object.assign(new Error("Shipment not found"), { statusCode: 404 });

  return prisma.document.findMany({
    where: { shipmentId },
    orderBy: { createdAt: "desc" },
  });
}
