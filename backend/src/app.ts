import express from "express";
import { corsMiddleware } from "./config/cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import routes from "./routes/index.routes";

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

app.use(errorMiddleware);

export { app };
