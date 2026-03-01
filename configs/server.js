'use strict'
import connectionDB from "./mongo.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";

const middlewares = (app) => {
    app.use(helmet());
    app.use(cors());
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
};

const connectionMongoDB = async() =>{
    try{
        await connectionDB();
    }catch(error){
        console.error("Error connecting to MongoDB:", error);
    }
};

export const initializeServer = async() => {
    const app = express();
    try{
        middlewares(app);
        await connectionMongoDB();
        app.listen(process.env.PORT, () => {
            console.log(`Server | Server is running on port ${process.env.PORT}`);
        });
    }catch(error){
        console.error("Error initializing server:", error);
    }
}