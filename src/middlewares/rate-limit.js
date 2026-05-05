import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // Limita a 5 peticiones por IP por ventana
  skipSuccessfulRequests: true, // No penaliza intentos que sí autentican
  message: {
    success: false,
    message:
      "Demasiados intentos desde esta IP, por favor intente de nuevo después de 15 minutos",
  },
  standardHeaders: true, // Retorna rate limit en las cabeceras `RateLimit-*`
  legacyHeaders: false, // Deshabilita cabeceras `X-RateLimit-*`
});
