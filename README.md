# Bowmenn MVP — Logistics Platform

Bowmenn is a tech-enabled logistics platform that seamlessly connects shippers with over 1,000 vetted carriers across Nigeria. Built to handle the end-to-end delivery lifecycle, the platform allows customers to instantly book shipments, drivers to accept and fulfill jobs with real-time proof of delivery, and administrators to orchestrate the entire network from a centralized dashboard.

## Live Demo links
- **Frontend**: [Vercel URL placeholder]
- **Backend API**: [Railway URL placeholder]

## Test Credentials
You can use the following seeded accounts to test the different role-based portals:
- **Admin**: admin@bowmenn.com / Admin1234!
- **Customer**: testcustomer@bowmenn.com / Test1234!
- **Driver**: driver1@bowmenn.com / Driver1234!

## Architecture

The system utilizes a unified three-portal architecture (Customer, Driver, Admin) consolidated within a single Next.js frontend application. The backend is a robust Express + TypeScript REST API that enforces role-based access control (RBAC) via custom middleware.

```text
  +-------------------+
  | Next.js Frontend  |
  | (App Router)      |
  +--------+----------+
           | (REST API via Axios)
           v
  +-------------------+        +----------------------+
  | Express Backend   +------> | Cloudinary           |
  | (Node.js + TS)    |        | (POD image storage)  |
  +--------+----------+        +----------------------+
           | (Prisma ORM)
           v
  +-------------------+
  | PostgreSQL DB     |
  | (Railway)         |
  +-------------------+
```

## Technology choices

- **Next.js**: Provides a single codebase for all three portals. The App Router enables clean layout separation, nested routing, and seamless route protection via middleware.
- **Express + TypeScript**: A lightweight, well-supported, and type-safe backend framework that allows for rapid API development with strict schema validation.
- **PostgreSQL + Prisma**: Ensures relational data integrity, highly type-safe queries, and effortless database migrations.
- **JWT with httpOnly cookies**: Implements stateless authentication and highly secure refresh token storage, protecting against XSS attacks.
- **Cloudinary**: Fully managed file storage solution, ensuring Proof of Delivery (POD) images are securely stored and rapidly served via CDN.
- **Railway**: Simplifies backend infrastructure with one-click PostgreSQL provisioning and frictionless Node.js hosting.
- **Vercel**: The native, optimized deployment platform for Next.js applications, providing edge caching and continuous deployment.

## Setup instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm

### 1. Clone the repository
```bash
git clone https://github.com/your-username/bowmenn.git
cd bowmenn
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Fill in the `.env` values (Database URL, JWT secrets, Cloudinary keys).
```bash
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
```
Ensure `NEXT_PUBLIC_API_URL` is set to `http://localhost:5000` (or your production URL).
```bash
npm run dev
```

### 4. Seed Data
Run `npm run prisma:seed` in `backend/` to create the test accounts listed above after your migration finishes.

## Features implemented
- [x] **Authentication**: JWT-based login, registration, and refresh token rotation
- [x] **RBAC**: Strict role-based routing and API protection (Customer, Driver, Admin)
- [x] **Premium UI**: Webflow-inspired editorial design system using Tailwind CSS
- [x] **Customer Portal**: Dashboard, active shipment tracking, and delivery booking form
- [x] **Driver Portal**: Active job management, available jobs board, status updates, and historical earnings
- [x] **Proof of Delivery**: Secure image upload functionality for drivers completing a job
- [x] **Admin Portal**: Global metrics dashboard and system-wide tracking
- [x] **Shipment Management**: Admin-forced status overrides and manual driver assignment
- [x] **User Management**: Admin-only driver registration and customer directory
- [x] **Global Notifications**: Application-wide toast notifications for seamless UX feedback

## Features intentionally excluded from MVP
- **Real-time GPS tracking via WebSockets**: Excluded to keep the MVP focused. Status updates provide sufficient visibility for launch. Will be added in v2.
- **Payment gateway integration**: Excluded because MVP assumes offline or invoiced payments. Paystack integration planned for v2.
- **Automated dispatch engine**: Admin manually assigns drivers for MVP. Algorithmic assignment based on proximity planned for v2.
- **Native mobile apps**: Responsive web covers the MVP. React Native driver app planned once web is validated.
- **SMS and WhatsApp notifications**: Excluded to reduce third-party dependencies in MVP. BullMQ + Termii integration planned for v2.
- **Email notifications**: Same reason as above. Resend integration planned for v2.

## Future improvements
- Real-time Socket.io GPS tracking
- Paystack payment integration
- Automated driver assignment by proximity using Google Maps
- React Native driver mobile app for better offline and background location support
- SMS and WhatsApp notifications via Termii and Twilio
- Analytics and reporting dashboard
- Multi-stop shipment routing
- Carrier rating and review system

## Database Schema

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
  refreshTokenVersion Int @default(0)
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
  type       String
  createdAt  DateTime @default(now())

  shipment   Shipment @relation(fields: [shipmentId], references: [id])

  @@index([shipmentId])
}
```

### Table Descriptions
- **User**: Stores all platform accounts (Customers, Drivers, Admins) and handles core authentication.
- **DriverProfile**: Contains specialized fields specific to drivers, such as vehicle type, availability status, and license information.
- **Shipment**: The core entity tracking a delivery from creation through its lifecycle (Pending to Completed), storing cargo specs, route, and price.
- **Document**: Stores references to externally hosted files related to a shipment, such as Cloudinary URLs for Proof of Delivery (POD) images.
