import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

/**
 * PATCH /api/driver/availability
 * Toggle driver's availability status.
 */
export async function updateAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const { isAvailable } = req.body;

    const profile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: "Driver profile not found" });
      return;
    }

    const updated = await prisma.driverProfile.update({
      where: { userId: req.user!.userId },
      data: { isAvailable },
    });

    res.json({ success: true, isAvailable: updated.isAvailable });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/driver/location
 * Update driver's current GPS location.
 */
export async function updateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const { lat, lng } = req.body;

    await prisma.driverProfile.update({
      where: { userId: req.user!.userId },
      data: { currentLat: lat, currentLng: lng },
    });

    res.json({ success: true, message: "Location updated" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/driver/profile
 * Get the current driver's profile info.
 */
export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.userId },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: "Driver profile not found" });
      return;
    }

    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
}
