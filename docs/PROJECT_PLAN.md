# Bowmenn MVP - Project Plan

## Overview
Bowmenn is a tech-enabled logistics platform designed to connect customers with drivers for seamless cargo delivery. The MVP focuses on the core workflow: booking shipments, driver assignment, real-time tracking (via status updates), and proof of delivery.

## Technology Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (Access & Refresh Tokens)
- **File Uploads**: Cloudinary (Proof of Delivery, documents)
- **Hosting**: Railway (Backend API & PostgreSQL), Vercel (Next.js Frontend)

## Folder Structure
We will use a modular structure within this repository.
```text
/
├── frontend/           # Next.js Application
│   ├── src/
│   │   ├── app/        # App router (pages, layouts)
│   │   ├── components/ # Reusable UI components
│   │   ├── lib/        # API clients, utilities
│   │   └── types/      # Frontend TypeScript types
├── backend/            # Express Application
│   ├── src/
│   │   ├── controllers/# Route handlers
│   │   ├── middlewares/# Auth, error handling
│   │   ├── routes/     # Express route definitions
│   │   ├── services/   # Business logic
│   │   └── utils/      # Helpers (Cloudinary, JWT)
│   ├── prisma/         # Prisma schema and migrations
│   └── tests/          # Backend tests
├── PROJECT_PLAN.md
├── DATABASE_SCHEMA.md
├── API_DESIGN.md
├── FRONTEND_ROUTES.md
└── README.md           # Main project overview
```

## 7-Day Build Plan

- **Day 1: Setup & Database**
  - Initialize `frontend` and `backend` projects.
  - Set up Prisma with PostgreSQL.
  - Apply initial database schema and migrations.
- **Day 2: Authentication & Core Backend**
  - Implement JWT registration/login for Customer, Driver, Admin.
  - Setup Express middleware for role-based access control (RBAC).
- **Day 3: Backend - Shipments & Logic**
  - Implement Shipment CRUD endpoints.
  - Implement State Machine transitions for Shipments.
  - Integrate Cloudinary for Proof of Delivery uploads.
- **Day 4: Frontend - Foundation & Customer Portal**
  - Setup Tailwind CSS, layout, and common components (buttons, forms).
  - Implement Auth pages (Login, Register).
  - Build Customer Dashboard (Book a shipment, view history).
- **Day 5: Frontend - Driver Portal**
  - Build Driver Dashboard (View available jobs, accept job).
  - Build Active Job view (Status updates, POD upload).
- **Day 6: Frontend - Admin Portal**
  - Build Admin Dashboard (System overview).
  - Build global shipment management and user oversight views.
- **Day 7: Polish, Testing & Deployment**
  - End-to-end testing of the critical path (Booking -> Delivered).
  - Refine UI/UX (responsive design).
  - Deploy Backend/DB to Railway and Frontend to Vercel.
