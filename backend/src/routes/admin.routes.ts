import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import {
  createDriver,
  listUsers,
  listDrivers,
  getAllShipments,
  assignDriver,
  adminUpdateStatus,
} from "../controllers/admin.controller";

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(authorize("ADMIN"));

// User management
router.get("/users", listUsers);
router.post("/users/drivers", createDriver);
router.get("/users/drivers", listDrivers);

// Shipment management
router.get("/shipments", getAllShipments);
router.patch("/shipments/:id/assign", assignDriver);
router.patch("/shipments/:id/status", adminUpdateStatus);

export default router;
