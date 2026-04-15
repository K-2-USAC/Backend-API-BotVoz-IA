import { hash, verify } from "argon2";
import User from "../user/user.model.js";
import { generateJWT } from "../helpers/generate-jwt.js";

export const register = async(req, res) =>{
    try{
        const data = req.body;
        data.password = await hash(data.password);

        const user = await User.create(data);
        const token = await generateJWT(user.id);

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 60 * 60 * 1000 // 1 hora de vida del token
        });

        return res.status(201).json({
            success: true,
            message: "User registration successful",
            userDetails:{
                id: user._id,
                role: user.role
            }
        });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "User registration failed",
            error: error.message
        })
    }
}

export const login = async(req, res) =>{
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email: email});

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found, please check the credentials and try again",
                error: "User not found"
            })
        };

        const verifyPass = await verify(user.password, password);

        if(!verifyPass){
            return res.status(401).json({
                success: false,
                message: "User login failed, the credentials are not valid, please check and try again",
                error: "Invalid password"
            })
        };

        const token = await generateJWT(user._id); 
        res.cookie("auth_token", token,{
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 60 * 60 * 1000 // 1 hora de vida del token
        });

        return res.status(200).json({
            success: true,
            message: "User login successful",
            userDetails:{
                id: user._id,
                role: user.role
            }
        })

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "User login failed, the credentials are not valid, please check and try again",
            error: error.message
        })
    }
}