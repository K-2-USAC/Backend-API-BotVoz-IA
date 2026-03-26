import { WebSocketServer } from 'ws';
import OpenAI from "openai";
import { client as groqClient } from "../../configs/server.js";

export const setupVoiceWebSocket = (server) => {
    
    const wss = new WebSocketServer({ 
        server, 
        path: "/api/voice-ai/groq/response" 
    });

    wss.on('connection', (ws) => {
        console.log("Cliente Java conectado al túnel WebSocket");

        ws.on('message', async (message) => {
            try {
                const textUser = message.toString();
                console.log("Java dice:", textUser);

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
                
                ws.send(JSON.stringify({ response: respuestaIA }));
                console.log("Respuesta enviada a Java");

            } catch (error) {
                console.error("Error con Groq:", error.message);
                ws.send(JSON.stringify({ error: "Error al procesar con la IA" }));
            }
        });

        ws.on('close', () => {
            console.log("Cliente Java desconectado.");
        });
    });
};