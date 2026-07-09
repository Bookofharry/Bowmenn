import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import shipmentRoutes from "./routes/shipment.routes";
import uploadRoutes from "./routes/upload.routes";
import driverRoutes from "./routes/driver.routes";

const app = express();

// Behind Railway's proxy — needed so rate limiting keys on the real client IP
app.set("trust proxy", 1);

// --------------- Middleware ---------------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// --------------- Rate Limiting ---------------
const isTest = process.env.NODE_ENV === "test";

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
});

function strictLimiter(limit: number) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isTest,
    message: { success: false, message: "Too many requests. Please try again later." },
  });
}

app.use("/api", globalLimiter);
app.use("/api/auth/login", strictLimiter(10));
app.use("/api/auth/register", strictLimiter(10));
app.use("/api/shipments/quote", strictLimiter(30));
// Blocks brute-forcing the 4-digit pickup/delivery codes
app.use("/api/shipments/:id/status", strictLimiter(20));

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

export default app;
