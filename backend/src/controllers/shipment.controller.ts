import { Request, Response, NextFunction } from "express";
import * as shipmentService from "../services/shipment.service";
import * as quoteService from "../services/quote.service";

/**
 * POST /api/shipments/quote — Compute and persist an instant price quote.
 * Body is validated by quoteRequestSchema.
 */
export async function quote(req: Request, res: Response, next: NextFunction) {
  try {
    const quote = await quoteService.createQuote(req.user!.userId, req.body);
    res.json({ success: true, quote });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/shipments — Customer books a shipment from a persisted quote.
 * Price/coords/distance come from the quote row, never from the client.
 * Body is validated by createShipmentSchema.
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const shipment = await shipmentService.createShipment(req.user!.userId, req.body);
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
 * GET /api/shipments/available — Unclaimed CONFIRMED shipments for drivers
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
 * GET /api/shipments/:id/documents — Documents for a shipment (ownership-checked)
 */
export async function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await shipmentService.getShipmentDocuments(
      req.params.id as string,
      req.user!.userId,
      req.user!.role
    );
    res.json({ success: true, documents });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/shipments/:id/accept — Driver accepts a CONFIRMED shipment
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
 * POST /api/shipments/:id/reject — Driver rejects a CONFIRMED/ASSIGNED shipment
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
 * PATCH /api/shipments/:id/status — Update shipment status (driver or admin).
 * Body is validated by updateStatusSchema.
 */
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, code } = req.body;

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
