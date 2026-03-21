import { Router } from "express";
import { getResponse } from "./groq.controller.js";
import { validateGroqIA } from "../middlewares/groq-ia-validator.js";

const router = Router();

router.post(
    "/response",
    validateGroqIA,
    getResponse
)

export default router;