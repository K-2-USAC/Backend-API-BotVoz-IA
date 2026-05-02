import { hash, verify } from "argon2";
import User from "../user/user.model.js";
import { generateJWT } from "../helpers/generate-jwt.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req, res) => {
  try {
    const data = req.body;

    const user = await User.create(data);
    const token = await generateJWT(user.id);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 60 * 60 * 1000, // 1 hora de vida del token
    });

    return res.status(201).json({
      success: true,
      message: "User registration successful",
      userDetails: {
        id: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User registration failed",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found, please check the credentials and try again",
        error: "User not found",
      });
    }

    const verifyPass = await verify(user.password, password);

    if (!verifyPass) {
      return res.status(401).json({
        success: false,
        message:
          "User login failed, the credentials are not valid, please check and try again",
        error: "Invalid password",
      });
    }

    const token = await generateJWT(user._id);
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 60 * 60 * 1000, // 1 hora de vida del token
    });

    return res.status(200).json({
      success: true,
      message: "User login successful",
      userDetails: {
        id: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "User login failed, the credentials are not valid, please check and try again",
      error: error.message,
    });
  }
};

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, given_name, family_name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: given_name || name,
        surname: family_name || " ",
        email,
        image: picture,
        googleId,
        authProvider: "google",
      });
    } else {
      if (user.authProvider !== "google") {
        user.authProvider = "google";
        user.googleId = googleId;
        if (!user.image) user.image = picture;
        await user.save();
      }
    }

    if (!user.status) {
      return res.status(403).json({
        success: false,
        message: "User is deactivated",
      });
    }

    const token = await generateJWT(user._id);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      userDetails: {
        id: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(400).json({
      success: false,
      message: "Invalid Google Token",
      error: error.message,
    });
  }
};
