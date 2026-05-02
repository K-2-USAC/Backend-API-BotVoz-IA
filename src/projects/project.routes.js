import { Router } from "express";
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    activateProject
} from "./project.controller.js";
import {
    createProjectValidator,
    getProjectByIdValidator,
    updateProjectValidator,
    deleteProjectValidator
} from "../middlewares/project-validator.js";
import { validateJWT } from "../middlewares/validate-jwt.js";

const router = Router();

// Retrieve all projects of the logged-in user
router.get("/", validateJWT, getProjects);

// Retrieve a specific project by id
router.get("/:id", getProjectByIdValidator, getProjectById);

// Create a new project
router.post("/", createProjectValidator, createProject);

// Update an existing project
router.put("/:id", updateProjectValidator, updateProject);

// Soft delete a project
router.delete("/:id", deleteProjectValidator, deleteProject);

// Activate a project
router.patch("/:id/activate", validateJWT, activateProject);

export default router;
