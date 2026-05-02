import CallLog from "./callLog.model.js";

// ── GET /api/voice-ai/calls  ──────────────────────────────────────────────
// Devuelve todos los registros de llamadas (paginado).
// Query params opcionales: page, limit, projectId, status
export const getAllCalls = async (req, res) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page)  || 1);
    const limit     = Math.min(100, parseInt(req.query.limit) || 20);
    const skip      = (page - 1) * limit;
    const filter    = {};

    if (req.query.projectId) filter.project  = req.query.projectId;
    if (req.query.status)    filter.status   = req.query.status;

    const [calls, total] = await Promise.all([
      CallLog.find(filter)
        .populate("project", "name type")
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CallLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: calls,
    });
  } catch (error) {
    console.error("[CallLog] getAllCalls error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el historial de llamadas",
      error: error.message,
    });
  }
};

// ── GET /api/voice-ai/calls/:callSid  ────────────────────────────────────
// Devuelve los detalles completos de una llamada específica, incluyendo
// todos los mensajes de la conversación.
export const getCallByCallSid = async (req, res) => {
  try {
    const { callSid } = req.params;

    const call = await CallLog.findOne({ callSid })
      .populate("project", "name type description")
      .lean();

    if (!call) {
      return res.status(404).json({
        success: false,
        message: `No se encontró una llamada con CallSid: ${callSid}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: call,
    });
  } catch (error) {
    console.error("[CallLog] getCallByCallSid error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la llamada",
      error: error.message,
    });
  }
};

// ── GET /api/voice-ai/calls/project/:projectId  ───────────────────────────
// Devuelve todas las llamadas de un proyecto específico.
export const getCallsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [calls, total] = await Promise.all([
      CallLog.find({ project: projectId })
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CallLog.countDocuments({ project: projectId }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: calls,
    });
  } catch (error) {
    console.error("[CallLog] getCallsByProject error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las llamadas del proyecto",
      error: error.message,
    });
  }
};

// ── DELETE /api/voice-ai/calls/:callSid  ─────────────────────────────────
// Elimina el registro de una llamada (solo admin).
export const deleteCall = async (req, res) => {
  try {
    const { callSid } = req.params;

    const deleted = await CallLog.findOneAndDelete({ callSid });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `No se encontró una llamada con CallSid: ${callSid}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Registro de llamada eliminado correctamente",
    });
  } catch (error) {
    console.error("[CallLog] deleteCall error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar la llamada",
      error: error.message,
    });
  }
};
