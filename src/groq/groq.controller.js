import twilio from 'twilio';
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const { VoiceResponse } = twilio.twiml;

const groqClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export const handleTwilioCall = async (req, res) => {
    console.log("[TWILIO CONECTADO] Datos recibidos:", req.body); 

    const twiml = new VoiceResponse();
    const textUser = req.body.SpeechResult;
    
    if (!textUser) {
        console.log("Iniciando saludo...");
        const gather = twiml.gather({
            input: 'speech',
            language: 'es-MX',
            action: '/api/voice-ai/groq/twilio', 
            method: 'POST'
        });

        gather.say({ language: 'es-MX' }, "Hola, soy tu asistente de inteligencia artificial. ¿De qué te gustaría hablar?");

        twiml.say({ language: 'es-MX' }, "No logré escucharte, por favor intenta de nuevo.");
        twiml.redirect('/api/voice-ai/groq/twilio'); 

        return res.type('text/xml').send(twiml.toString());
    }

    console.log("Usuario Dice:", textUser);

    try {
        const systemRestrictions = {
            role: "system",
            content: "You are a friendly conversation partner. If the user ask for a illegal request, you must refuse politely and tell them please we may speak of other topics, but be friendly. Use natural Spanish. Short replies. No lists. Be concise but engaging. Keep the flow like a real phone call."
        };

        const chatCompletion = await groqClient.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                systemRestrictions,
                { role: "user", content: textUser }
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        const respuestaIA = chatCompletion.choices[0].message.content || "Sin respuesta.";
        console.log("Groq respondió:", respuestaIA);

        const gather = twiml.gather({
            input: 'speech',
            language: 'es-MX',
            action: '/api/voice-ai/groq/twilio',
            method: 'POST'
        });

        gather.say({ language: 'es-MX' }, respuestaIA);

        twiml.say({ language: 'es-MX' }, "¿Sigues ahí?");
        twiml.redirect('/api/voice-ai/groq/twilio');

        res.type('text/xml').send(twiml.toString());

    } catch (error) {
        console.error("Error con Groq:", error.message);
        twiml.say({ language: 'es-MX' }, "Tuve un pequeño problema técnico, pero sigo aquí. ¿Me repites lo último?");
        res.type('text/xml').send(twiml.toString());
    }
};