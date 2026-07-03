import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import {
  getPassword,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  normalizeName,
  normalizePhone,
} from "../utils/authValidation";

const REFRESH_COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  path: "/",
};

const REFRESH_COOKIE_OPTIONS = {
  ...REFRESH_COOKIE_BASE_OPTIONS,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * POST /api/auth/register
 * Creates a CUSTOMER account. Role is not accepted from body.
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = getPassword(req.body.password);
    const name = normalizeName(req.body.name);
    const phone = normalizePhone(req.body.phone);

    if (!email || !password || !name) {
      res.status(400).json({ success: false, message: "Email, password, and name are required" });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ success: false, message: "Please provide a valid email address" });
      return;
    }

    if (!isValidPassword(password)) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
      return;
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
    if (existing) {
      res.status(409).json({ success: false, message: "Email already registered" });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        role: "CUSTOMER",
      },
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.refreshTokenVersion);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticates any user role. Returns access token, sets refresh token in httpOnly cookie.
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = getPassword(req.body.password);

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ success: false, message: "Please provide a valid email address" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.refreshTokenVersion);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 * Reads refresh token from httpOnly cookie, returns new access token.
 */
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ success: false, message: "No refresh token provided" });
      return;
    }

    const payload = verifyRefreshToken(token);

    // Verify user still exists
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshTokenVersion !== payload.tokenVersion) {
      res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
      return;
    }

    const refreshedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenVersion: {
          increment: 1,
        },
      },
      select: {
        id: true,
        role: true,
        refreshTokenVersion: true,
      },
    });

    const accessToken = generateAccessToken(refreshedUser.id, refreshedUser.role);
    const refreshToken = generateRefreshToken(refreshedUser.id, refreshedUser.refreshTokenVersion);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({ success: true, accessToken });
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
}

/**
 * POST /api/auth/logout
 * Clears the refresh token cookie.
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        await prisma.user.updateMany({
          where: {
            id: payload.userId,
            refreshTokenVersion: payload.tokenVersion,
          },
          data: {
            refreshTokenVersion: {
              increment: 1,
            },
          },
        });
      } catch {
        // Invalid refresh tokens should still be cleared client-side.
      }
    }

    res.clearCookie("refreshToken", REFRESH_COOKIE_BASE_OPTIONS);
    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    next(err);
  }
}
