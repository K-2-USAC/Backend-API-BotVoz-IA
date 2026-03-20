import User from "./user.model.js";
import argon2 from "argon2";

export const getAllUsers = async(req, res) =>{
    try{
        const users = await User.find();

        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            users: users
        });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve users",
            error: error.message
        })
    }
}

export const updatePassword = async(req,res) =>{
    try{
        const {uid} = req.params;
        const {newPassword} = req.body;

        const user = await User.findById(uid);

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const matchOldNewPassword = await argon2.verify(user.password, newPassword);

        if(matchOldNewPassword){
            return res.status(400).json({
                success: false,
                message: "New password cannot be the same as the old password"
            })
        }

        const encryptedPassword = await argon2.hash(newPassword);

        await User.findByIdAndUpdate(uid, {password: encryptedPassword}, {new: true});

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to update password",
            error: error.message
        })
    }
}

export const deleteUser = async (req, res) => {
    try {

        const { uid } = req.params;

        const user = await User.findByIdAndUpdate(
            uid,
            { status: false },
            { new: true }
        );

        res.status(200).json({
        success: true,
        message: "User deleted successfully",
        user,
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "Error deleting user",
        error: error.message,
        });
    }
};