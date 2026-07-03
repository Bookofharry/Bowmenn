# Database Schema (Prisma & PostgreSQL)

This document outlines the database schema for the Bowmenn MVP, highlighting all tables, columns, relationships, and indexing strategies.

## Tables & Explanations

### `User`
Stores authentication and basic profile data for all roles.
- **Indexes**: `email` (unique) for fast login lookups. `role` for filtering users by type.

### `DriverProfile`
Extends the `User` table for driver-specific information.
- **Relationships**: 1-to-1 with `User`.
- **Indexes**: `userId` (unique).

### `Shipment`
The core entity representing a delivery order.
- **Relationships**: Belongs to a Customer (`User`), optionally belongs to a `DriverProfile`.
- **Indexes**: 
  - `customerId` (frequent lookups by customer).
  - `driverId` (frequent lookups by driver).
  - `status` (for dashboard filtering, e.g., finding PENDING shipments).

### `Document`
Stores file references (like Proof of Delivery) uploaded via Cloudinary.
- **Relationships**: Belongs to a `Shipment`.
- **Indexes**: `shipmentId` (to fetch all docs for a shipment).

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CUSTOMER
  DRIVER
  ADMIN
}

enum ShipmentStatus {
  PENDING
  ASSIGNED
  PICKED_UP
  IN_TRANSIT
  DELIVERED
  COMPLETED
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role     @default(CUSTOMER)
  name         String
  phone        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  driverProfile DriverProfile?
  shipments     Shipment[]     @relation("CustomerShipments")

  @@index([email])
  @@index([role])
}

model DriverProfile {
  id            String   @id @default(uuid())
  userId        String   @unique
  vehicleType   String
  licenseNumber String
  isAvailable   Boolean  @default(true)
  currentLat    Float?
  currentLng    Float?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User       @relation(fields: [userId], references: [id])
  shipments     Shipment[] @relation("DriverShipments")

  @@index([userId])
}

model Shipment {
  id             String         @id @default(uuid())
  customerId     String
  driverId       String?
  pickupAddress  String
  dropoffAddress String
  pickupLat      Float?
  pickupLng      Float?
  dropoffLat     Float?
  dropoffLng     Float?
  status         ShipmentStatus @default(PENDING)
  price          Float
  cargoDetails   String
  cargoWeight    Float
  truckType      String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  customer       User           @relation("CustomerShipments", fields: [customerId], references: [id])
  driver         DriverProfile? @relation("DriverShipments", fields: [driverId], references: [id])
  documents      Document[]

  @@index([customerId])
  @@index([driverId])
  @@index([status])
}

model Document {
  id         String   @id @default(uuid())
  shipmentId String
  url        String
  type       String   // e.g., "POD_PHOTO", "SIGNATURE"
  createdAt  DateTime @default(now())

  shipment   Shipment @relation(fields: [shipmentId], references: [id])

  @@index([shipmentId])
}
```
