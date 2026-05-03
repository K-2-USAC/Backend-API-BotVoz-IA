import { catchErrors } from "../middlewares/catch-errors.js";
import { hasRoles } from "../middlewares/validate-role.js"
import { validateJWT } from "../middlewares/validate-jwt.js";
import {validateFields} from "../middlewares/fields-validator.js";
import { body, param } from "express-validator";

export const getUser = [
    validateJWT,
    hasRoles("admin"),
    catchErrors
]

export const updatePasswordValidator = [
    validateJWT,
    param("uid", "Invalid user ID").isMongoId(),
    body("oldPassword", "Old password is required").notEmpty(),
    body("newPassword", "New password must be at least 8 characters long").notEmpty().withMessage("New password is required").isLength({min: 8}),
    validateFields,
    catchErrors
]

export const deleteUserValidator = [
    validateJWT,
    hasRoles("admin"),
    param("uid", "Invalid user ID").isMongoId().notEmpty().withMessage("User ID is required"),
    validateFields,
    catchErrors
]

export const updateProfileValidator = [
    validateJWT,
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("surname").optional().notEmpty().withMessage("Surname cannot be empty"),
    body("phone").optional().notEmpty().withMessage("Phone cannot be empty"),
    validateFields,
    catchErrors
]