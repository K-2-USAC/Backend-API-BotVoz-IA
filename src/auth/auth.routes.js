import { Router } from "express";
import { register, login} from "./auth.controller.js";
import { loginValidator, registerValidator } from "../middlewares/auth-validator.js";

const router = Router();

router.post(
    "/register", 
    register,
    registerValidator
);

router.post(
    "/login",
    login,
    loginValidator
)

export default router;