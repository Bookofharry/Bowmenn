import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { availabilitySchema, locationSchema } from "../schemas";
import { updateAvailability, updateLocation, getProfile } from "../controllers/driver.controller";

const router = Router();

router.use(authenticate);
router.use(authorize("DRIVER"));

router.get("/profile", getProfile);
router.patch("/availability", validate(availabilitySchema), updateAvailability);
router.patch("/location", validate(locationSchema), updateLocation);

export default router;
