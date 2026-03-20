import { Router } from "express";
import { deleteUser, getAllUsers , updatePassword} from "../user/user.controller.js";
import { getUser, deleteUserValidator, updatePasswordValidator} from "../middlewares/user-validator.js";

const router = Router();

router.get(
    "/",
    getUser,
    getAllUsers
)

router.patch(
    "/update-password/:uid",
    updatePasswordValidator,
    updatePassword
)

router.patch(
    "/delete/:uid",
    deleteUserValidator,
    deleteUser
)


export default router;