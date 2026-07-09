import prisma from "../utils/prisma";
import { ShipmentStatus } from "@prisma/client";

// ───────── Helpers ─────────

function httpError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

async function getDriverProfileId(userId: string): Promise<string | null> {
  const profile = await prisma.driverProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id || null;
}

/**
 * The pickup/delivery codes are secrets the driver must obtain from the
 * shipper/receiver in person — they must never appear in driver-facing responses.
 */
function stripCodes<T extends { pickupCode?: string | null; deliveryCode?: string | null }>(
  shipment: T
): T {
  return { ...shipment, pickupCode: null, deliveryCode: null };
}

async function canAccessShipment(
  shipment: { customerId: string; driverId: string | null; status: ShipmentStatus },
  userId: string,
  role: string
): Promise<boolean> {
  if (role === "ADMIN") return true;
  if (role === "CUSTOMER") return shipment.customerId === userId;
  if (role === "DRIVER") {
    const profileId = await getDriverProfileId(userId);
    if (profileId && shipment.driverId === profileId) return true;
    // Unclaimed CONFIRMED shipments are visible to all drivers (available jobs)
    return shipment.status === "CONFIRMED" && !shipment.driverId;
  }
  return false;
}

// ───────── Customer Operations ─────────

interface CreateShipmentData {
  quoteId: string;
  pickupAddress: string;
  dropoffAddress: string;
  cargoDetails: string;
  truckType: string;
}

export async function createShipment(customerId: string, data: CreateShipmentData) {
  // Price, coordinates, and distance come from the server-side quote —
  // never from the client.
  const quote = await prisma.quote.findUnique({
    where: { id: data.quoteId },
    include: { shipment: { select: { id: true } } },
  });

  if (!quote || quote.customerId !== customerId) {
    throw httpError("Quote not found. Please request a new quote.", 400);
  }
  if (quote.shipment) {
    throw httpError("This quote has already been used for a shipment.", 400);
  }
  if (quote.expiresAt.getTime() <= Date.now()) {
    throw httpError("Your quote has expired. Please request a new quote.", 400);
  }

  // Generate 4-digit codes
  const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
  const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

  return prisma.shipment.create({
    data: {
      customerId,
      quoteId: quote.id,
      pickupAddress: data.pickupAddress,
      dropoffAddress: data.dropoffAddress,
      pickupLat: quote.pickupLat,
      pickupLng: quote.pickupLng,
      dropoffLat: quote.dropoffLat,
      dropoffLng: quote.dropoffLng,
      cargoDetails: data.cargoDetails,
      cargoWeight: quote.cargoWeight,
      truckType: data.truckType,
      price: quote.totalAmount,
      quoteExpiresAt: quote.expiresAt,
      distanceKm: quote.distanceKm,
      estimatedTimeMins: quote.estimatedTimeMins,
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
  if (!(await canAccessShipment(shipment, userId, role))) return null;

  return role === "DRIVER" ? stripCodes(shipment) : shipment;
}

// ───────── Driver Operations ─────────

export async function getAvailableShipments() {
  const shipments = await prisma.shipment.findMany({
    where: { status: "CONFIRMED", driverId: null },
    include: {
      customer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return shipments.map(stripCodes);
}

export async function getDriverShipments(userId: string) {
  const profileId = await getDriverProfileId(userId);
  if (!profileId) throw httpError("Driver profile not found", 404);

  const shipments = await prisma.shipment.findMany({
    where: { driverId: profileId },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      documents: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return shipments.map(stripCodes);
}

export async function acceptShipment(shipmentId: string, userId: string) {
  const profileId = await getDriverProfileId(userId);
  if (!profileId) throw httpError("Driver profile not found", 404);

  // Atomic conditional write so two drivers can't both claim the same job
  const result = await prisma.shipment.updateMany({
    where: {
      id: shipmentId,
      status: "CONFIRMED",
      OR: [{ driverId: null }, { driverId: profileId }],
    },
    data: { driverId: profileId, status: "ASSIGNED" },
  });

  if (result.count === 0) {
    throw httpError("Shipment is no longer available for acceptance", 409);
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      driver: { select: { id: true, vehicleType: true, user: { select: { name: true } } } },
    },
  });
  return shipment ? stripCodes(shipment) : shipment;
}

export async function rejectShipment(shipmentId: string, userId: string) {
  const profileId = await getDriverProfileId(userId);
  if (!profileId) throw httpError("Driver profile not found", 404);

  // CONFIRMED covers admin-assigned jobs the driver hasn't accepted yet
  const result = await prisma.shipment.updateMany({
    where: {
      id: shipmentId,
      driverId: profileId,
      status: { in: ["CONFIRMED", "ASSIGNED"] },
    },
    data: { driverId: null, status: "CONFIRMED" },
  });

  if (result.count === 0) {
    throw httpError("Cannot reject: shipment not assigned to you", 400);
  }

  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  return shipment ? stripCodes(shipment) : shipment;
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
  if (!shipment) throw httpError("Shipment not found", 404);

  // ADMIN override: any transition
  if (role === "ADMIN") {
    return prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: newStatus },
    });
  }

  // DRIVER transitions
  if (role === "DRIVER") {
    const profileId = await getDriverProfileId(userId);
    if (!profileId || shipment.driverId !== profileId) {
      throw httpError("Shipment not assigned to you", 403);
    }

    const expectedNext = DRIVER_TRANSITIONS[shipment.status];
    if (!expectedNext || expectedNext !== newStatus) {
      throw httpError(`Invalid transition: cannot go from ${shipment.status} to ${newStatus}`, 400);
    }

    // ASSIGNED → PICKED_UP requires pickupCode
    if (newStatus === "PICKED_UP" && shipment.pickupCode) {
      if (!code || code !== shipment.pickupCode) {
        throw httpError("Invalid Pickup Code. Please ask the shipper for the 4-digit code.", 400);
      }
    }

    // IN_TRANSIT → DELIVERED requires POD
    if (shipment.status === "IN_TRANSIT" && newStatus === "DELIVERED") {
      if (shipment.documents.length === 0) {
        throw httpError("Cannot mark as DELIVERED without uploading Proof of Delivery", 400);
      }
    }

    // DELIVERED → COMPLETED requires deliveryCode
    if (newStatus === "COMPLETED" && shipment.deliveryCode) {
      if (!code || code !== shipment.deliveryCode) {
        throw httpError("Invalid Delivery Code. Please ask the receiver for the 4-digit code.", 400);
      }
    }

    const updated = await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: newStatus },
      include: {
        customer: { select: { id: true, name: true } },
        driver: { select: { id: true, user: { select: { name: true } } } },
      },
    });
    return stripCodes(updated);
  }

  throw httpError("Customers cannot update shipment status", 403);
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
  if (!driverProfile) throw httpError("Driver profile not found", 404);

  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) throw httpError("Shipment not found", 404);

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

export async function getShipmentDocuments(shipmentId: string, userId: string, role: string) {
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) throw httpError("Shipment not found", 404);
  if (!(await canAccessShipment(shipment, userId, role))) {
    throw httpError("You do not have access to this shipment's documents", 403);
  }

  return prisma.document.findMany({
    where: { shipmentId },
    orderBy: { createdAt: "desc" },
  });
}
