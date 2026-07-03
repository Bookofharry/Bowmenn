import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import * as shipmentCtrl from "../controllers/shipment.controller";

const router = Router();

// Public routes
router.post("/quote", shipmentCtrl.quote);

// All shipment routes require authentication
router.use(authenticate);

// Customer routes
router.post("/", authorize("CUSTOMER"), shipmentCtrl.create);
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
router.patch("/:id/status", authorize("DRIVER", "ADMIN"), shipmentCtrl.updateStatus);

export default router;
