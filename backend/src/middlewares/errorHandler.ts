import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Railway sleeping database connections
  if (message.includes("Can't reach database server") || message.includes("P1001") || message.includes("Connection string")) {
    statusCode = 503;
    message = "The database is currently waking up from sleep. Please wait a few seconds and try again.";
  }
  // Handle Prisma Unique Constraint Violation (P2002)
  else if (message.includes("Unique constraint failed") || message.includes("P2002")) {
    statusCode = 409;
    message = "This information is already in use. Please try using different details.";
  }
  // Handle Prisma Record Not Found (P2025)
  else if (message.includes("Record to update not found") || message.includes("P2025")) {
    statusCode = 404;
    message = "The item you are trying to modify could not be found.";
  }
  // Handle Prisma Enum / Validation Errors
  else if (message.includes("Invalid value for argument") || message.includes("invalid input value for enum") || message.includes("PrismaClientValidationError")) {
    statusCode = 400;
    message = "We received invalid data. Please refresh the page and try again. (If you are the developer, you may need to run 'npx prisma generate' and restart the server).";
  }

  console.error(`[Error] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
