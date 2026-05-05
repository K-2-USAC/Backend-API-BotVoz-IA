"use strict";
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

const whitelist = new Set([
  "http://localhost:5173",
  "https://backend-api-bot-voz-ia.vercel.app",
  "https://vox2k.vercel.app",
]);

const corsOptions = {
  origin: (origin, callback) => {
    // Same-origin/server-to-server requests may not include Origin
    if (!origin) {
      callback(null, true);
      return;
    }

    const isExactAllowed = whitelist.has(origin);
    const isVercelPreview =
      typeof origin === "string" &&
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

    // Never throw from CORS origin callback (that becomes HTTP 500 on preflight)
    callback(null, isExactAllowed || isVercelPreview);
  },
  credentials: true,
  optionsSuccessStatus: 204, // Para compatibilidad con navegadores legacy en preflights
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

const middlewares = (app) => {
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  // CORS debe ir antes que cualquier otro middleware para que los preflights pasen
  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));
  app.use(morgan("dev"));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};

const routes = (app) => {
  app.get("/", (req, res) => {
    res.status(200).json({
      message: "Welcome to the Voice AI Backend API",
      status: "Online",
      documentation:
        "https://backend-api-bot-voz-ia.vercel.app/api/voice-ai/docs", // Assuming they might have docs
    });
  });
  app.use("/api/voice-ai/auth", authRoutes);
  app.use("/api/voice-ai/user", userRoutes);
  app.use("/api/voice-ai/groq", groqRoutes);
  app.use("/api/voice-ai/projects", projectRoutes);
  app.use("/api/voice-ai/calls", callLogRoutes);
};

const connectionMongoDB = async () => {
  try {
    await connectionDB();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
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

export const initializeServer = async () => {
  const app = express();
  // Required behind Vercel/proxies so req.ip and security middlewares work correctly
  app.set("trust proxy", 1);
  try {
    middlewares(app);
    routes(app);
    await connectionMongoDB();
    await createDefaultAdmin();

    // En Vercel no es estrictamente necesario el app.listen,
    // pero lo mantenemos para desarrollo local.
    if (process.env.NODE_ENV !== "production") {
      app.listen(process.env.PORT, () => {
        console.log(`Server | Server is running on port ${process.env.PORT}`);
      });
    }

    return app;
  } catch (error) {
    console.error("Error initializing server:", error);
    return app;
  }
};
