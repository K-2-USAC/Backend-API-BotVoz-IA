'use strict'
import connectionDB from "./mongo.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "../src/auth/auth.routes.js";
import userRoutes from "../src/user/user.routes.js";
import groqRoutes from "../src/groq/groq.routes.js";

const whitelist =[
    "http://localhost:5173"
]

const corsOptions = {
    origin: whitelist,
    credentials: true
}

const middlewares = (app) => {
    app.use(helmet());
    app.use(cors(corsOptions));
    app.use(morgan("dev"));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
};

const routes = (app) =>{
    app.use("/api/voice-ai/auth", authRoutes);
    app.use("/api/voice-ai/user", userRoutes);
    app.use("/api/voice-ai/groq", groqRoutes);
}

const connectionMongoDB = async() =>{
    try{
        await connectionDB();
    }catch(error){
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Cierra el proceso si no tiene conexion a la base de datos o si no existe una
    }
};

export const initializeServer = async() => {
    const app = express();
    try{
        middlewares(app);
        routes(app);
        await connectionMongoDB();

        const server = app.listen(process.env.PORT, () => {
            console.log(`Server | Server is running on port ${process.env.PORT}`);
        });

        
    }catch(error){
        console.error("Error initializing server:", error);
    }
}