export const catchErrors = (err, req, res, next) =>{
    
    if(err.status === 400 || err.error){
        return res.status(400).json({
            success: false,
            error: err.error
        })
    }

    return res.status(500).json({
        success: false,
        message: err.message
    });
}