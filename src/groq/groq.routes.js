import { Router } from "express";
import { handleTwilioCall } from "./groq.controller.js";

const router = Router();

router.post("/twilio", handleTwilioCall);

export default router;