import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export interface JwtPayload {
  userId: string;
  role: string;
}

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT.ACCESS_SECRET, {
    expiresIn: env.JWT.ACCESS_TTL as jwt.SignOptions["expiresIn"],
  });
};

export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT.REFRESH_SECRET, {
    expiresIn: env.JWT.REFRESH_TTL as jwt.SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, env.JWT.ACCESS_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, env.JWT.REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};
