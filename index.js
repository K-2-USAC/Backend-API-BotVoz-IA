import env from "dotenv";
import {initializeServer} from "./configs/server.js";

env.config();
const app = await initializeServer();
export default app;