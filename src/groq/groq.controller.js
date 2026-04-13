import twilio from 'twilio';
import OpenAI from "openai";
import dotenv from "dotenv";

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

    // Crea el documento XML que Twilio espera como respuesta.
    const twiml = new VoiceResponse();
    // Twilio manda el texto reconocido por voz en SpeechResult.
    const textUser = req.body.SpeechResult;
    
    // Si todavía no hay texto, se inicia el primer turno de conversación.
    if (!textUser) {
        console.log("Iniciando saludo...");
        // gather escucha la voz del usuario y, cuando termina, envía la transcripción a la ruta action.
        const gather = twiml.gather({
            input: 'speech',
            language: 'es-MX',
            action: '/api/voice-ai/groq/twilio', 
            method: 'POST'
        });

        // Mensaje inicial que escucha la persona cuando se establece la llamada.
        gather.say({ language: 'es-MX' }, "Hola, soy tu asistente de inteligencia artificial. ¿De qué te gustaría hablar?");

        // Mensaje de respaldo si Twilio no detecta voz en ese intento.
        twiml.say({ language: 'es-MX' }, "No logré escucharte, por favor intenta de nuevo.");
        // Vuelve a esta misma ruta para seguir esperando entrada de voz.
        twiml.redirect('/api/voice-ai/groq/twilio'); 

        return res.type('text/xml').send(twiml.toString());
    }

    console.log("Usuario Dice:", textUser);

    try {
        // Instrucciones del sistema para controlar tono, idioma y estilo de respuesta.
        const systemRestrictions = {
            role: "system",
            content: "You are a friendly conversation partner. If the user ask for a illegal request, you must refuse politely and tell them please we may speak of other topics, but be friendly. Use natural Spanish. Short replies. No lists. Be concise but engaging. Keep the flow like a real phone call."
        };

        // Envía el mensaje del usuario a Groq y pide una completación de chat.
        const chatCompletion = await groqClient.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                systemRestrictions,
                { role: "user", content: textUser }
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        // Toma el texto de la primera respuesta generada por la IA.
        const respuestaIA = chatCompletion.choices[0].message.content || "Sin respuesta.";
        console.log("Groq respondió:", respuestaIA);

        // Se vuelve a usar gather para escuchar la siguiente respuesta del usuario.
        const gather = twiml.gather({
            input: 'speech',
            language: 'es-MX',
            action: '/api/voice-ai/groq/twilio',
            method: 'POST'
        });

        // La IA habla con la persona antes de esperar el siguiente turno.
        gather.say({ language: 'es-MX' }, respuestaIA);

        // Mensaje corto de cierre antes de regresar al mismo webhook.
        twiml.say({ language: 'es-MX' }, "¿Sigues ahí?");
        twiml.redirect('/api/voice-ai/groq/twilio');

        res.type('text/xml').send(twiml.toString());

    } catch (error) {
        // Si Groq falla, se responde con un mensaje de error más amable.
        console.error("Error con Groq:", error.message);
        twiml.say({ language: 'es-MX' }, "Tuve un pequeño problema técnico, pero sigo aquí. ¿Me repites lo último?");
        res.type('text/xml').send(twiml.toString());
    }
};