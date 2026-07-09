import { z } from "zod";
import { ShipmentStatus } from "@prisma/client";

// ───────── Shared fields ─────────

const email = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Please provide a valid email address");

const password = z
  .string({ required_error: "Password is required" })
  .min(6, "Password must be at least 6 characters long")
  .max(128, "Password is too long");

const name = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(1, "Name is required")
  .max(100, "Name is too long");

const phone = z
  .string()
  .trim()
  .max(30, "Phone number is too long")
  .optional()
  .transform((v) => v || null);

const latitude = z.coerce.number().min(-90, "Invalid latitude").max(90, "Invalid latitude");
const longitude = z.coerce.number().min(-180, "Invalid longitude").max(180, "Invalid longitude");

// ───────── Auth ─────────

export const registerSchema = z.object({
  email,
  password,
  name,
  phone,
});

export const loginSchema = z.object({
  email,
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

// ───────── Admin ─────────

export const createDriverSchema = z.object({
  email,
  password,
  name,
  phone,
  vehicleType: z.string({ required_error: "vehicleType is required" }).trim().min(1, "vehicleType is required").max(50),
  licenseNumber: z.string({ required_error: "licenseNumber is required" }).trim().min(1, "licenseNumber is required").max(50),
});

export const assignDriverSchema = z.object({
  driverId: z.string({ required_error: "driverId is required" }).uuid("driverId must be a valid id"),
});

// ───────── Shipments ─────────

export const quoteRequestSchema = z.object({
  pickupLat: latitude,
  pickupLng: longitude,
  dropoffLat: latitude,
  dropoffLng: longitude,
  cargoWeight: z.coerce
    .number({ required_error: "cargoWeight is required", invalid_type_error: "cargoWeight must be a number" })
    .positive("cargoWeight must be greater than 0")
    .max(100000, "cargoWeight is too large"),
});

export const createShipmentSchema = z.object({
  quoteId: z.string({ required_error: "quoteId is required" }).uuid("quoteId must be a valid id"),
  pickupAddress: z.string({ required_error: "pickupAddress is required" }).trim().min(3, "pickupAddress is required").max(500),
  dropoffAddress: z.string({ required_error: "dropoffAddress is required" }).trim().min(3, "dropoffAddress is required").max(500),
  cargoDetails: z.string({ required_error: "cargoDetails is required" }).trim().min(1, "cargoDetails is required").max(1000),
  truckType: z.string({ required_error: "truckType is required" }).trim().min(1, "truckType is required").max(50),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(ShipmentStatus, {
    errorMap: () => ({ message: "status must be a valid shipment status" }),
  }),
  code: z.string().trim().regex(/^\d{4}$/, "code must be a 4-digit number").optional(),
});

// ───────── Driver ─────────

export const availabilitySchema = z.object({
  isAvailable: z.boolean({
    required_error: "isAvailable (boolean) is required",
    invalid_type_error: "isAvailable (boolean) is required",
  }),
});

export const locationSchema = z.object({
  lat: latitude,
  lng: longitude,
});
