import jwt from "jsonwebtoken";
import {token} from "morgan";

export const generateJWT = (uid = "") =>{
    return new Promise((resolve, reject) =>{
        const payload = {uid};

        jwt.sign(
            payload,
            process.env.SECRET_KEY,
            {
                expiresIn: "1h"
            },
            (err, token) =>{
                if(err){
                    reject({
                        success: false,
                    })
                }else{
                    resolve(token);
                }
            }
        )
    })
}