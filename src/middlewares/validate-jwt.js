import jwt from "jsonwebtoken";
import User from "../user/user.model.js"

const getJwtSecret = () =>
    process.env.SECRET_KEY ||
    process.env.JWT_SECRET ||
    process.env.SECRETORPRIVATEKEY;

export const validateJWT = async (req, res, next) => {
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

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
        return res.status(500).json({
        success: false,
        message: "JWT secret is not configured on server",
        });
    }

    let uid;
    try {
        ({ uid } = jwt.verify(token, jwtSecret));
    } catch (jwtError) {
        return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        });
    }

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

    req.user = user;
    next();
    } catch (error) {
    console.error("JWT Validation Error:", error);
    return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
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

        const jwtSecret = getJwtSecret();
        if (!jwtSecret) {
        return res.status(500).json({
            success: false,
            message: "JWT secret is not configured on server",
        });
        }

        const { uid } = jwt.verify(token, jwtSecret);
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
