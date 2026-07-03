import jwt from "jsonwebtoken";

function resolveSecret(envKey: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET", fallback: string): string {
  const value = process.env[envKey];
  if (value) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${envKey} must be set in production`);
  }

  return fallback;
}

const ACCESS_SECRET = resolveSecret("JWT_ACCESS_SECRET", "dev-access-secret");
const REFRESH_SECRET = resolveSecret("JWT_REFRESH_SECRET", "dev-refresh-secret");

export interface TokenPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

export function generateAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, ACCESS_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(userId: string, tokenVersion: number): string {
  return jwt.sign({ userId, tokenVersion }, REFRESH_SECRET, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
}
