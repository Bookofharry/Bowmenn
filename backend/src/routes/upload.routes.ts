import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../middlewares/auth";
import { uploadPOD } from "../controllers/upload.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router = Router();

router.use(authenticate);

// POST /api/uploads/pod — Driver uploads proof of delivery
router.post("/pod", authorize("DRIVER"), upload.single("file"), uploadPOD);

export default router;
