import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "omea-admin-secret-change-in-production"
);

const COOKIE_NAME = "admin-token";

interface AuthData {
  email: string;
  passwordHash: string;
}

function getAuthData(): AuthData {
  const filepath = path.join(process.cwd(), "data", "auth.json");
  return JSON.parse(fs.readFileSync(filepath, "utf-8"));
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const auth = getAuthData();
  if (email !== auth.email) return false;
  return bcrypt.compare(password, auth.passwordHash);
}

export async function createToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}

export { COOKIE_NAME };
