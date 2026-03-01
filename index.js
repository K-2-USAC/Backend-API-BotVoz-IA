import env from "dotenv";
import {initializeServer} from "./configs/server.js";

env.config();
initializeServer();