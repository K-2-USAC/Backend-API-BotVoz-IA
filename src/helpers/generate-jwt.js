import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.SECRET_KEY ||
  process.env.JWT_SECRET ||
  process.env.SECRETORPRIVATEKEY;

export const generateJWT = (uid = "") =>{
    return new Promise((resolve, reject) =>{
        if (!JWT_SECRET) {
            reject(new Error("JWT secret is not configured"));
            return;
        }

        const payload = {uid};

        jwt.sign(
            payload,
            JWT_SECRET,
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
