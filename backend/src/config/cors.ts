import cors from "cors";
import type { CorsOptions } from "cors";
import { env } from "./env";

const corsOptions: CorsOptions = {
  origin: env.NODE_ENV === "production" ? false : true,
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
