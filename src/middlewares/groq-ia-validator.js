import { validateJWT } from "./validate-jwt.js";
import { catchErrors } from "./catch-errors.js";
import { body } from "express-validator";

export const validateGroqIA = [
    body("prompt", "Prompt is required").notEmpty().withMessage("Prompt cannot be empty").isString().withMessage("Prompt must be a string"),
    validateJWT,
    catchErrors
]