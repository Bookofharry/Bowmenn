import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { updateAvailability, updateLocation, getProfile } from "../controllers/driver.controller";

const router = Router();

router.use(authenticate);
router.use(authorize("DRIVER"));

router.get("/profile", getProfile);
router.patch("/availability", updateAvailability);
router.patch("/location", updateLocation);

export default router;
