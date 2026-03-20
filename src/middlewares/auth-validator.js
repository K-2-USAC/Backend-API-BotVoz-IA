import { body } from "express-validator";
import { validateFields } from "./fields-validator.js";

export const loginValidator = [
    body("email").isString().withMessage("Email must be a string").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("password").isString().withMessage("Password must be a string").notEmpty().withMessage("Password is required"),
    validateFields
]

export const registerValidator = [
    body("name").isString().withMessage("Name must be a string").notEmpty().withMessage("Name is required"),
    body("surname").isString().withMessage("Surname must be a string").notEmpty().withMessage("Surname is required"),
    body("phone").isString().withMessage("Phone must be a string").notEmpty().withMessage("Phone is required"),
    body("email").isString().withMessage("Email must be a string").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("password").isString().withMessage("Password must be a string").notEmpty().withMessage("Password is required").length({min: 6}).withMessage("Password must be at least 6 characters long"  ),
    validateFields
]