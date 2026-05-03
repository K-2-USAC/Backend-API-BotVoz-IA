import { Router } from "express";
import { register, login, googleLogin } from "./auth.controller.js";
import { loginValidator, registerValidator } from "../middlewares/auth-validator.js";
import { authLimiter } from "../middlewares/rate-limit.js";

const router = Router();

router.post(
    "/register", 
    authLimiter,
    registerValidator,
    register
);

router.post(
    "/login",
    authLimiter,
    loginValidator,
    login
)

router.post(
    "/google",
    authLimiter,
    googleLogin
)

export default router;