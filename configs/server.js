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
import projectRoutes from "../src/projects/project.routes.js";
import callLogRoutes from "../src/callLog/callLog.routes.js";
import User from "../src/user/user.model.js";

const whitelist =[
    "http://localhost:5173",
    "https://vox2k-af31kr9hu-luisrafaelcr27-gmailcoms-projects.vercel.app",
    "https://backend-api-bot-voz-ia.vercel.app" // Agregamos por si acaso
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
    app.get("/", (req, res) => {
        res.status(200).json({
            message: "Welcome to the Voice AI Backend API",
            status: "Online",
            documentation: "https://backend-api-bot-voz-ia.vercel.app/api/voice-ai/docs" // Assuming they might have docs
        });
    });
    app.use("/api/voice-ai/auth", authRoutes);
    app.use("/api/voice-ai/user", userRoutes);
    app.use("/api/voice-ai/groq", groqRoutes);
    app.use("/api/voice-ai/projects", projectRoutes);
    app.use("/api/voice-ai/calls", callLogRoutes);
}

const connectionMongoDB = async() =>{
    try{
        await connectionDB();
    }catch(error){
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Cierra el proceso si no tiene conexion a la base de datos o si no existe una
    }
};

const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: "admin" });
        if (!adminExists) {
            const admin = new User({
                name: "Admin",
                surname: "Principal",
                phone: "00000000",
                email: "admin@k2.com",
                password: "adminPassword123!",
                role: "admin",
                image: "https://via.placeholder.com/150",
            });
            await admin.save();
            console.log("Admin | Default admin user created successfully.");
        } else {
            console.log("Admin | Admin user already exists.");
        }
    } catch (error) {
        console.error("Error creating default admin:", error);
    }
};

export const initializeServer = async() => {
    const app = express();
    try{
        middlewares(app);
        routes(app);
        await connectionMongoDB();
        await createDefaultAdmin();

        // En Vercel no es estrictamente necesario el app.listen, 
        // pero lo mantenemos para desarrollo local.
        if (process.env.NODE_ENV !== 'production') {
            app.listen(process.env.PORT, () => {
                console.log(`Server | Server is running on port ${process.env.PORT}`);
            });
        }
        
        return app;
    }catch(error){
        console.error("Error initializing server:", error);
        return app;
    }
}