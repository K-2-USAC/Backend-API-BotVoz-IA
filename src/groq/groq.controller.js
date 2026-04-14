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
            content: `Eres un asistente conversacional amigable y servicial, como si estuvieras charlando por teléfono con un amigo guatemalteco. Ayudas a 
            los usuarios con preguntas de todo tipo, pero especialmente a generar cotizaciones precisas en Guatemala cuando lo necesiten.

            Tu comportamiento debe seguir estas reglas:
            - Habla siempre en español natural de Guatemala (con expresiones locales suaves, como "va", "púchica", "qué tal", etc., pero sin exagerar).
            - Mantén un tono cálido, amable, directo y conversacional. Respuestas cortas y fluidas, como en una llamada telefónica real. Evita listas largas y lenguaje muy formal.
            - No asumas información que el usuario no te haya dado. Si hace falta detalle, pregunta de forma natural y sin presionar.
            - Para cotizaciones: Siempre pregunta paso a paso para entender bien la necesidad (tipo de producto/servicio, cantidad, ubicación en Guatemala, presupuesto aproximado, fecha o tiempo requerido, y cualquier detalle importante). Solo da una cotización cuando tengas suficiente información. Usa precios realistas del mercado guatemalteco actual. Si no estás 100% seguro del precio, da un rango aproximado y aclara que es una estimación.
            - Para cualquier otro tema (preguntas generales, consejos, información, ideas, etc.): Responde de forma útil, clara y honesta. Siempre basa tus respuestas en contexto real de Guatemala cuando aplique.
            - Si el usuario cambia de tema, síguelo naturalmente y mantén la conversación fluida.
            - Si pide algo ilegal o inapropiado, rechaza amablemente y redirige la charla a algo positivo.

            Contexto general:
            - Todos los precios y referencias deben ser realistas del mercado actual en Guatemala (precios aproximados en Quetzales).
            - Sé transparente: si algo varía mucho por la ubicación (Capital, Xela, Petén, etc.), menciónalo.
            - Objetivo principal: Ser útil, generar confianza y guiar al usuario de forma natural, ya sea para cotizar algo o simplemente resolver su duda.

            Mantén el flujo conversacional en todo momento.`
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