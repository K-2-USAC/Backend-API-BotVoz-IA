import twilio from "twilio";
import OpenAI from "openai";
import dotenv from "dotenv";
import Project from "../projects/project.model.js";
import CallLog from "../callLog/callLog.model.js";

dotenv.config();

// Extrae la clase que Twilio usa para construir respuestas de voz en TwiML.
const { VoiceResponse } = twilio.twiml;

// Cliente de Groq usando el SDK de OpenAI, pero apuntando al endpoint de Groq.
const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const handleTwilioCall = async (req, res) => {
  // Muestra en consola lo que Twilio envía al webhook.
  console.log("[TWILIO CONECTADO] Datos recibidos:", req.body);

  const projectId = req.query.projectId;
  const actionUrl = projectId
    ? `/api/voice-ai/groq/twilio?projectId=${projectId}`
    : "/api/voice-ai/groq/twilio";

  // Crea el documento XML que Twilio espera como respuesta.
  const twiml = new VoiceResponse();
  // Twilio manda el texto reconocido por voz en SpeechResult.
  const textUser = req.body.SpeechResult;

  // Identificadores de la llamada que Twilio siempre envía en el body
  const callSid    = req.body.CallSid    || null;
  const callerPhone = req.body.From      || "unknown";
  const calledPhone = req.body.To        || "unknown";

  // Si todavía no hay texto, se inicia el primer turno de conversación.
  if (!textUser) {
    console.log("Iniciando saludo...");

    // Aseguramos que exista un registro de la llamada en la BD (upsert)
    if (callSid) {
      await CallLog.findOneAndUpdate(
        { callSid },
        {
          $setOnInsert: {
            callSid,
            callerPhone,
            calledPhone,
            project: projectId || null,
            status: "active",
            startedAt: new Date(),
          },
        },
        { upsert: true, new: true },
      );
    }

    // gather escucha la voz del usuario y, cuando termina, envía la transcripción a la ruta action.
    const gather = twiml.gather({
      input: "speech",
      language: "es-MX",
      action: actionUrl,
      method: "POST",
    });

    // Mensaje inicial que escucha la persona cuando se establece la llamada.
    gather.say(
      { language: "es-MX" },
      "Hola, soy tu asistente virtual. ¿En qué te puedo ayudar hoy?",
    );

    // Mensaje de respaldo si Twilio no detecta voz en ese intento.
    twiml.say(
      { language: "es-MX" },
      "No logré escucharte, por favor intenta de nuevo.",
    );
    // Vuelve a esta misma ruta para seguir esperando entrada de voz.
    twiml.redirect(actionUrl);

    return res.type("text/xml").send(twiml.toString());
  }

  console.log("Usuario Dice:", textUser);

  try {
    let systemPrompt = `Eres un asistente conversacional útil y fluido por teléfono.
        Reglas:
        - Mantén un tono amigable, directo y conversacional. Respuestas cortas y fluidas.
        - No asumas información que no te hayan dado.
        - Mantén el flujo conversacional.`;

    // Si se envió el ID de un proyecto por la URL, nutrimos la IA con esa data
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        const faqs =
          project.faqs && project.faqs.length > 0
            ? project.faqs
                .map((f) => `Q: ${f.question} | A: ${f.answer}`)
                .join("\n")
            : "No hay FAQs.";

        const kb =
          project.knowledgeBase && project.knowledgeBase.length > 0
            ? project.knowledgeBase.join(", ")
            : "Sin conocimiento adicional.";

        systemPrompt = `Eres un asistente de IA para el negocio llamado "${project.name}".
                Tono de voz: ${project.voiceTone || "Profesional y amigable"}.
                Audiencia objetivo: ${project.targetAudience || "General"}.
                
                Contexto del negocio:
                ${project.description}
                ${project.context}
                Horarios: ${project.businessHours || "No especificados"}
                
                Base de conocimiento:
                ${kb}
                
                Preguntas Frecuentes (FAQs):
                ${faqs}
                
                Tu comportamiento:
                - Habla siempre de forma natural, como en una llamada telefónica real.
                - Mantén tus respuestas cortas y al grano, máximo 2 o 3 oraciones.
                - Evita leer listas largas. Trata de mantener un diálogo interactivo.
                - Basa todas tus respuestas estrictamente en el contexto y FAQs proveídos del negocio.`;
      }
    }

    const systemRestrictions = {
      role: "system",
      content: systemPrompt,
    };

    // Envía el mensaje del usuario a Groq y pide una completación de chat.
    const chatCompletion = await groqClient.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [systemRestrictions, { role: "user", content: textUser }],
      temperature: 0.7,
      max_tokens: 150,
    });

    // Toma el texto de la primera respuesta generada por la IA.
    const respuestaIA =
      chatCompletion.choices[0].message.content || "Sin respuesta.";
    console.log("Groq respondió:", respuestaIA);

    // ── Persistir el turno de conversación en MongoDB ──────────────────────
    if (callSid) {
      await CallLog.findOneAndUpdate(
        { callSid },
        {
          // Si el documento aún no existe, inicializarlo
          $setOnInsert: {
            callSid,
            callerPhone,
            calledPhone,
            project: projectId || null,
            status: "active",
            startedAt: new Date(),
          },
          // Agregar ambos mensajes del turno al array
          $push: {
            messages: {
              $each: [
                { role: "user",      content: textUser,    timestamp: new Date() },
                { role: "assistant", content: respuestaIA, timestamp: new Date() },
              ],
            },
          },
          // Actualizar la hora del último intercambio
          $set: { endedAt: new Date() },
        },
        { upsert: true, new: true },
      );
    }
    // ───────────────────────────────────────────────────────────────────────

    // Se vuelve a usar gather para escuchar la siguiente respuesta del usuario.
    const gather = twiml.gather({
      input: "speech",
      language: "es-MX",
      action: actionUrl,
      method: "POST",
    });

    // La IA habla con la persona antes de esperar el siguiente turno.
    gather.say({ language: "es-MX" }, respuestaIA);

    // Mensaje corto de cierre antes de regresar al mismo webhook.
    twiml.say({ language: "es-MX" }, "¿Sigues ahí?");
    twiml.redirect(actionUrl);

    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    // Si Groq falla, se responde con un mensaje de error más amable.
    console.error("Error con Groq u operación de DB:", error.message);

    // Marcar la llamada como fallida
    if (callSid) {
      await CallLog.findOneAndUpdate(
        { callSid },
        { $set: { status: "failed", endedAt: new Date() } },
      ).catch(() => {}); // silencioso para no bloquear la respuesta TwiML
    }

    twiml.say(
      { language: "es-MX" },
      "Tuve un pequeño problema técnico, pero sigo aquí. ¿Me repites lo último?",
    );
    res.type("text/xml").send(twiml.toString());
  }
};
