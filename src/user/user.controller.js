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
        const {oldPassword, newPassword} = req.body;

        // Validar que el usuario solo pueda cambiar su propia contraseña (IDOR fix)
        if (req.user._id.toString() !== uid && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "No tienes permiso para cambiar esta contraseña"
            });
        }

        const user = await User.findById(uid);

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // Verificar contraseña antigua
        const matchOldPassword = await argon2.verify(user.password, oldPassword);

        // Si es admin y está cambiando otra cuenta, podríamos saltar este paso, pero por seguridad y simplicidad lo requerimos.
        // Opcionalmente, si es admin y cambia otra clave, omitimos la verificación de oldPassword si es incorrecta.
        if(!matchOldPassword && req.user._id.toString() === uid){
            return res.status(401).json({
                success: false,
                message: "La contraseña antigua es incorrecta"
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

export const getUserProfile = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving profile",
            error: error.message
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { uid } = req.user;
        const data = req.body;

        // Evitar que el usuario cambie su propio rol o estado a través de esta ruta
        delete data.role;
        delete data.status;
        delete data.password; // La contraseña se cambia en otra ruta

        const updatedUser = await User.findByIdAndUpdate(uid, data, { new: true });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message
        });
    }
};