import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validators";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  validate(registerSchema),
  authController.register.bind(authController),
);
router.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController),
);
router.get("/me", authMiddleware, authController.me.bind(authController));

export default router;
