import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";

const accessTokenPayloadSchema = z.object({
  userId: z.string(),
});

export interface IJwtService {
  signAccessToken(payload: { userId: string }): string;
  verifyAccessToken(token: string): { userId: string };
}

interface JwtConfig {
  secret: string;
  expiresInSeconds: number;
}

export class JwtService implements IJwtService {
  private secret: string;
  private expiresInSeconds: number;

  constructor(
    config: JwtConfig = {
      secret: env.JWT_SECRET,
      expiresInSeconds: env.JWT_EXPIRES_IN,
    },
  ) {
    this.secret = config.secret;
    this.expiresInSeconds = config.expiresInSeconds;
  }

  signAccessToken(payload: { userId: string }): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresInSeconds });
  }

  verifyAccessToken(token: string): { userId: string } {
    const decoded = jwt.verify(token, this.secret);

    return accessTokenPayloadSchema.parse(decoded);
  }
}
