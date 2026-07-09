import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { quoteRequestSchema, createShipmentSchema, updateStatusSchema } from "../schemas";
import * as shipmentCtrl from "../controllers/shipment.controller";

const router = Router();

// All shipment routes require authentication
router.use(authenticate);

// Customer routes — quotes are persisted per customer, so quoting requires login
router.post("/quote", authorize("CUSTOMER"), validate(quoteRequestSchema), shipmentCtrl.quote);
router.post("/", authorize("CUSTOMER"), validate(createShipmentSchema), shipmentCtrl.create);
router.get("/", authorize("CUSTOMER"), shipmentCtrl.getMyShipments);

// Driver routes (must be before /:id to avoid route conflicts)
router.get("/available", authorize("DRIVER"), shipmentCtrl.getAvailable);
router.get("/driver", authorize("DRIVER"), shipmentCtrl.getDriverJobs);

// Shared — ownership is checked in the service layer
router.get("/:id", shipmentCtrl.getById);
router.get("/:id/documents", shipmentCtrl.getDocuments);

// Driver actions
router.patch("/:id/accept", authorize("DRIVER"), shipmentCtrl.accept);
router.post("/:id/reject", authorize("DRIVER"), shipmentCtrl.reject);

// Driver + Admin status update
router.patch("/:id/status", authorize("DRIVER", "ADMIN"), validate(updateStatusSchema), shipmentCtrl.updateStatus);

export default router;
