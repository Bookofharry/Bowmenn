import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import shipmentRoutes from "./routes/shipment.routes";
import uploadRoutes from "./routes/upload.routes";
import driverRoutes from "./routes/driver.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middleware ---------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// --------------- Health Check ---------------
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// --------------- Routes ---------------
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/driver", driverRoutes);

// --------------- Error Handling ---------------
app.use(errorHandler);

// --------------- Start Server ---------------
app.listen(PORT, () => {
  console.log(`[Bowmenn] Server running on port ${PORT}`);
});

export default app;
