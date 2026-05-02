import { body, param } from "express-validator";
import { validateFields } from "./fields-validator.js";
import { catchErrors } from "./catch-errors.js";
import { validateJWT } from "./validate-jwt.js";

export const createProjectValidator = [
    validateJWT,
    body("name", "The name is required").not().isEmpty(),
    body("description", "The description is required").not().isEmpty(),
    body("agentId", "The agent ID is required").not().isEmpty(),
    validateFields,
    catchErrors
];

export const getProjectByIdValidator = [
    validateJWT,
    param("id", "Not a valid ID").isMongoId(),
    validateFields,
    catchErrors
];

export const updateProjectValidator = [
    validateJWT,
    param("id", "Not a valid ID").isMongoId(),
    validateFields,
    catchErrors
];

export const deleteProjectValidator = [
    validateJWT,
    param("id", "Not a valid ID").isMongoId(),
    validateFields,
    catchErrors
];
