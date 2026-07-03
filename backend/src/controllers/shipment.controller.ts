import { Request, Response, NextFunction } from "express";
import * as shipmentService from "../services/shipment.service";
import * as mapsService from "../services/maps.service";
import * as quoteService from "../services/quote.service";

/**
 * POST /api/shipments/quote — Get instant price quote
 */
export async function quote(req: Request, res: Response, next: NextFunction) {
  try {
    const { pickupLat, pickupLng, dropoffLat, dropoffLng, cargoWeight } = req.body;

    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng || cargoWeight == null) {
      res.status(400).json({
        success: false,
        message: "pickupLat, pickupLng, dropoffLat, dropoffLng, and cargoWeight are required for quote",
      });
      return;
    }

    const { distanceMeters, durationSeconds } = await mapsService.getDistanceMatrix(
      { lat: parseFloat(pickupLat), lng: parseFloat(pickupLng) },
      { lat: parseFloat(dropoffLat), lng: parseFloat(dropoffLng) }
    );

    const breakdown = quoteService.calculateQuote(distanceMeters, durationSeconds, parseFloat(cargoWeight));

    res.json({ success: true, quote: breakdown });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/shipments — Customer creates a DRAFT shipment
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { pickupAddress, dropoffAddress, cargoDetails, cargoWeight, truckType, price, pickupLat, pickupLng, dropoffLat, dropoffLng, distanceKm, estimatedTimeMins, quoteExpiresAt } = req.body;

    if (!pickupAddress || !dropoffAddress || !cargoDetails || cargoWeight == null || !truckType || price == null) {
      res.status(400).json({
        success: false,
        message: "pickupAddress, dropoffAddress, cargoDetails, cargoWeight, truckType, and price are required",
      });
      return;
    }

    const shipment = await shipmentService.createShipment(req.user!.userId, {
      pickupAddress,
      dropoffAddress,
      cargoDetails,
      cargoWeight: parseFloat(cargoWeight),
      truckType,
      price: parseFloat(price),
      pickupLat: pickupLat ? parseFloat(pickupLat) : undefined,
      pickupLng: pickupLng ? parseFloat(pickupLng) : undefined,
      dropoffLat: dropoffLat ? parseFloat(dropoffLat) : undefined,
      dropoffLng: dropoffLng ? parseFloat(dropoffLng) : undefined,
      distanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
      estimatedTimeMins: estimatedTimeMins ? parseInt(estimatedTimeMins) : undefined,
      quoteExpiresAt: quoteExpiresAt ? new Date(quoteExpiresAt) : undefined,
    });

    res.status(201).json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/shipments — Customer's shipments
 */
export async function getMyShipments(req: Request, res: Response, next: NextFunction) {
  try {
    const shipments = await shipmentService.getCustomerShipments(req.user!.userId);
    res.json({ success: true, shipments });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/shipments/available — PENDING shipments for drivers
 */
export async function getAvailable(req: Request, res: Response, next: NextFunction) {
  try {
    const shipments = await shipmentService.getAvailableShipments();
    res.json({ success: true, shipments });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/shipments/driver — Driver's assigned shipments
 */
export async function getDriverJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const shipments = await shipmentService.getDriverShipments(req.user!.userId);
    res.json({ success: true, shipments });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/shipments/:id — Shipment detail (ownership-checked)
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const shipment = await shipmentService.getShipmentById(
      req.params.id as string,
      req.user!.userId,
      req.user!.role
    );
    if (!shipment) {
      res.status(404).json({ success: false, message: "Shipment not found" });
      return;
    }
    res.json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/shipments/:id/documents — Documents for a shipment
 */
export async function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await shipmentService.getShipmentDocuments(req.params.id as string);
    res.json({ success: true, documents });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/shipments/:id/accept — Driver accepts a PENDING shipment
 */
export async function accept(req: Request, res: Response, next: NextFunction) {
  try {
    const shipment = await shipmentService.acceptShipment(req.params.id as string, req.user!.userId);
    res.json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/shipments/:id/reject — Driver rejects an ASSIGNED shipment
 */
export async function reject(req: Request, res: Response, next: NextFunction) {
  try {
    const shipment = await shipmentService.rejectShipment(req.params.id as string, req.user!.userId);
    res.json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/shipments/:id/status — Update shipment status (driver or admin)
 */
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, code } = req.body;
    if (!status) {
      res.status(400).json({ success: false, message: "status is required" });
      return;
    }

    const shipment = await shipmentService.updateShipmentStatus(
      req.params.id as string,
      req.user!.userId,
      req.user!.role,
      status,
      code
    );
    res.json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
}
