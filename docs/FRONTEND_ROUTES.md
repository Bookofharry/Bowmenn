# Frontend Routes (Next.js App Router)

## Public Routes
- `/` - Landing Page (Hero, value proposition).
- `/login` - Unified login for all roles. Redirects based on user role.
- `/register` - Customer/Driver registration.

## Customer Portal (`/customer/*`)
Access: `CUSTOMER` role.
- `/customer/dashboard` - Overview of recent shipments, quick book button.
- `/customer/book` - Multi-step form to create a new shipment (Addresses, cargo details, quote).
- `/customer/shipments` - List of all past and current shipments.
- `/customer/shipments/[id]` - Status timeline, driver info, and POD viewing.

## Driver Portal (`/driver/*`)
Access: `DRIVER` role.
- `/driver/dashboard` - Toggle availability status, view currently assigned active job.
- `/driver/jobs/available` - List of `PENDING` shipments nearby waiting for assignment.
- `/driver/jobs/[id]` - Job details. Allows driver to accept (if pending), or update status (`PICKED_UP`, `IN_TRANSIT`, `DELIVERED`).
- `/driver/jobs/[id]/pod` - Upload Proof of Delivery (Photo/Signature) to trigger `DELIVERED` status.
- `/driver/history` - List of completed payouts and trips.

## Admin Portal (`/admin/*`)
Access: `ADMIN` role.
- `/admin/dashboard` - Platform metrics (Active trips, unassigned shipments, daily revenue).
- `/admin/shipments` - Table of all shipments with filtering by status. Ability to manually override statuses or assign drivers.
- `/admin/users` - Manage customers and drivers.
