import jwt from "jsonwebtoken";
import User from "../user/user.model.js";

export const validateJWT = async (req, res, next) => {
  try {
    let token =
      req.cookies?.auth_token ||
      req.body.token ||
      req.query.token ||
      req.headers["authorization"];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token not found",
      });
    }

    token = token.replace(/^Bearer\s+/, "");

    if (!process.env.SECRET_KEY) {
      throw new Error("SECRET_KEY is not defined in environment variables");
    }

    const { uid } = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(uid);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "The user doesn't exist in the database",
      });
    }

    if (user.status === false) {
      return res.status(400).json({
        success: false,
        message: "User deactivated previously",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Validation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error at validate token",
      error: error.message,
    });
  }
};

export const validateTokenResponse = async (req, res) => {
  try {
    let token =
      req.cookies?.auth_token ||
      req.body.token ||
      req.query.token ||
      req.headers["authorization"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    token = token.replace(/^Bearer\s+/, "");

    const { uid } = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(uid);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The user doesn't exist in the database",
      });
    }

    if (user.status === false) {
      return res.status(401).json({
        success: false,
        message: "User deactivated previously",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};
