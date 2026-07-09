import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createDriverSchema, assignDriverSchema, updateStatusSchema } from "../schemas";
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
router.post("/users/drivers", validate(createDriverSchema), createDriver);
router.get("/users/drivers", listDrivers);

// Shipment management
router.get("/shipments", getAllShipments);
router.patch("/shipments/:id/assign", validate(assignDriverSchema), assignDriver);
router.patch("/shipments/:id/status", validate(updateStatusSchema), adminUpdateStatus);

export default router;
