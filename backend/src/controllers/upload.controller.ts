import { Request, Response, NextFunction } from "express";
import { uploadToCloudinary, savePOD, assertPODUploadAllowed } from "../services/upload.service";

/**
 * POST /api/uploads/pod
 * Accepts multipart/form-data with fields: file, shipmentId, type (optional)
 */
export async function uploadPOD(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    const { shipmentId, type } = req.body;

    if (!file) {
      res.status(400).json({ success: false, message: "File is required" });
      return;
    }

    if (!shipmentId) {
      res.status(400).json({ success: false, message: "shipmentId is required" });
      return;
    }

    await assertPODUploadAllowed(shipmentId, req.user!.userId);

    const url = await uploadToCloudinary(file.buffer);
    const document = await savePOD(shipmentId, url, type || "POD_PHOTO");

    res.status(201).json({
      success: true,
      url: document.url,
      id: document.id,
    });
  } catch (err) {
    next(err);
  }
}
