import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { hashPassword } from "../utils/password";
import * as shipmentService from "../services/shipment.service";

/**
 * POST /api/admin/users/drivers
 * Admin-only: creates a user with DRIVER role + DriverProfile.
 * Body is validated/normalized by createDriverSchema.
 */
export async function createDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, phone, vehicleType, licenseNumber } = req.body;

    // Check for existing email
    const existing = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
    if (existing) {
      res.status(409).json({ success: false, message: "Email already registered" });
      return;
    }

    const passwordHash = await hashPassword(password);

    // Create user and driver profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone,
          role: "DRIVER",
        },
      });

      const driverProfile = await tx.driverProfile.create({
        data: {
          userId: user.id,
          vehicleType,
          licenseNumber,
        },
      });

      return { user, driverProfile };
    });

    res.status(201).json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        driverProfile: {
          id: result.driverProfile.id,
          vehicleType: result.driverProfile.vehicleType,
          licenseNumber: result.driverProfile.licenseNumber,
          isAvailable: result.driverProfile.isAvailable,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users
 * Admin-only: list all users.
 */
export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: { shipments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users/drivers
 * Admin-only: list all drivers with their profiles.
 */
export async function listDrivers(req: Request, res: Response, next: NextFunction) {
  try {
    const drivers = await prisma.user.findMany({
      where: { role: "DRIVER" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        driverProfile: {
          select: {
            id: true,
            vehicleType: true,
            licenseNumber: true,
            isAvailable: true,
            _count: {
              select: { shipments: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, drivers });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/shipments
 * Admin-only: list all shipments.
 */
export async function getAllShipments(req: Request, res: Response, next: NextFunction) {
  try {
    const shipments = await shipmentService.getAllShipments();
    res.json({ success: true, shipments });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/shipments/:id/assign
 * Admin-only: manually assign a driver to a shipment.
 */
export async function assignDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const { driverId } = req.body;
    const shipment = await shipmentService.adminAssignDriver(req.params.id as string, driverId);
    res.json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/shipments/:id/status
 * Admin-only: override shipment status.
 */
export async function adminUpdateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const shipment = await shipmentService.updateShipmentStatus(
      req.params.id as string,
      req.user!.userId,
      "ADMIN",
      status
    );
    res.json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
}
