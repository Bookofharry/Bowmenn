# API Design

RESTful endpoints for the Express backend.

## Authentication (Public)
| Method | Path | Body | Response | Roles | Description |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password, name, phone }` | `{ accessToken, user }` (Refresh token in httpOnly cookie) | Public | Register a new CUSTOMER account |
| POST | `/api/auth/login` | `{ email, password }` | `{ accessToken, user }` (Refresh token in httpOnly cookie) | Public | Authenticate user |
| POST | `/api/auth/refresh` | `httpOnly cookie (refreshToken)` | `{ accessToken }` | Public | Get new access token |

## Shipments
| Method | Path | Body | Response | Roles | Description |
|---|---|---|---|---|---|
| POST | `/api/shipments` | `{ pickupAddress, dropoffAddress, cargoDetails, price }` | `Shipment` | CUSTOMER | Book a shipment |
| GET | `/api/shipments` | None | `Shipment[]` | CUSTOMER | List customer's shipments |
| GET | `/api/shipments/available` | None | `Shipment[]` | DRIVER | List PENDING shipments |
| GET | `/api/shipments/driver` | None | `Shipment[]` | DRIVER | List driver's active/past jobs |
| GET | `/api/shipments/:id` | None | `Shipment` | ANY | Get shipment details |
| GET | `/api/shipments/:id/documents` | None | `Document[]` | ANY | Get documents (e.g., POD) for a shipment |
| PATCH | `/api/shipments/:id/accept` | None | `Shipment` | DRIVER | Driver accepts PENDING job |
| POST | `/api/shipments/:id/reject` | None | `Success` | DRIVER | Driver rejects PENDING job |
| PATCH | `/api/shipments/:id/status` | `{ status }` | `Shipment` | DRIVER, ADMIN | Update shipment status |

## Driver Features
| Method | Path | Body | Response | Roles | Description |
|---|---|---|---|---|---|
| PATCH | `/api/driver/location` | `{ lat, lng }` | `Success` | DRIVER | Update current location |
| PATCH | `/api/driver/availability` | `{ isAvailable }` | `Success` | DRIVER | Toggle accepting jobs |

## File Uploads
| Method | Path | Body | Response | Roles | Description |
|---|---|---|---|---|---|
| POST | `/api/uploads/pod` | `multipart/form-data (file, shipmentId)` | `{ url, id }` | DRIVER | Upload proof of delivery |

## Admin
| Method | Path | Body | Response | Roles | Description |
|---|---|---|---|---|---|
| GET | `/api/admin/users` | None | `User[]` | ADMIN | List all users |
| POST | `/api/admin/users/drivers` | `{ email, password, name, phone, vehicleType, licenseNumber }` | `User` | ADMIN | Create a new DRIVER account |
| GET | `/api/admin/users/drivers` | None | `User[]` | ADMIN | List all drivers |
| GET | `/api/admin/shipments` | None | `Shipment[]` | ADMIN | List all shipments |
| PATCH | `/api/admin/shipments/:id/assign` | `{ driverId }` | `Shipment` | ADMIN | Manually assign a driver |
