import { client } from "../../configs/server.js";

export const getResponse = async(req, res) =>{
    try{
        const { message } = req.body;
        const systemRestrictions = [{
            role: "system",
            content: "You are a friendly conversation partner. If the user ask for a illegal request, you must refuse politely and tell them please we may speak of other topics, but be friendly. Use natural Spanish. Short replies. No lists.Be concise but engaging. No bullet points. Keep the flow like a real phone call.",
        }]

        const chatCompletion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                ...systemRestrictions,
                { 
                    role: "user", 
                    content: message 
                }
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        return res.status(200).json({
            response: chatCompletion.choices[0].message.content || "No se recibió una respuesta válida de la API de Groq."
        })

    }catch(error){
        return res.status(500).json({
            error: "Error al obtener la respuesta de la API de Groq.",
            message: error.message
        })
    }
}