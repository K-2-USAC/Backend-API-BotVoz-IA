export const hasRoles = (...roles) => {
    return (req,res,next) =>{
        if(!req.user){
            return res.status(500).json({
                success: false,
                message: "A role needs to be verified before validating the token."
            })
        }

        if(!roles.includes(req.user.role)){
            return res.status(401).json({
                success: false,
                message:`The service requires certain roles: ${roles}`
            })
        }
        next()
    }
}