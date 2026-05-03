import { Router } from "express";
import {
  getAllCalls,
  getCallByCallSid,
  getCallsByProject,
  deleteCall,
  getGlobalStats,
} from "./callLog.controller.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { hasRoles } from "../middlewares/validate-role.js";

const router = Router();

// Obtener estadísticas globales
// GET /api/voice-ai/calls/stats/global
router.get("/stats/global", validateJWT, getGlobalStats);

// Obtener todas las llamadas (paginado) — protegido por JWT
// GET /api/voice-ai/calls?page=1&limit=20&projectId=xxx&status=completed
router.get("/", validateJWT, getAllCalls);

// Obtener llamadas de un proyecto específico
// GET /api/voice-ai/calls/project/:projectId
router.get("/project/:projectId", validateJWT, getCallsByProject);

// Obtener el detalle completo de una llamada (con todos los mensajes)
// GET /api/voice-ai/calls/:callSid
router.get("/:callSid", validateJWT, getCallByCallSid);

// Eliminar el registro de una llamada — solo admin
// DELETE /api/voice-ai/calls/:callSid
router.delete("/:callSid", validateJWT, hasRoles("admin"), deleteCall);

export default router;
