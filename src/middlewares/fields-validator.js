import { validationResult } from "express-validator";

export const validateFields = (req, res, next) =>{
    const error = validationResult(req);

    if(!error.isEmpty()){
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.array().map(err => err.msg)
        })
    }

    next();
}