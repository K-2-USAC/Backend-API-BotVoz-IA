import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  updatePassword,
  getUserProfile,
  updateUserProfile,
} from "../user/user.controller.js";
import {
  getUser,
  deleteUserValidator,
  updatePasswordValidator,
  updateProfileValidator,
} from "../middlewares/user-validator.js";
import { validateJWT } from "../middlewares/validate-jwt.js";

const router = Router();

router.get("/", getUser, getAllUsers);

router.get("/profile", validateJWT, getUserProfile);

router.patch("/profile/update", updateProfileValidator, updateUserProfile);

router.patch("/update-password/:uid", updatePasswordValidator, updatePassword);

router.patch("/delete/:uid", deleteUserValidator, deleteUser);

export default router;
