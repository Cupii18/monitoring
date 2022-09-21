const jwt = require("jsonwebtoken");

module.exports = async (req,res,next)=>{
    const authHeaders = req.headers.authorization;

    if(!authHeaders){
        return res.status(400).json({
            status : 0,
            message : "Tidak ada token"
        })
    } 
    jwt.verify(authHeaders, "AKU PADAMU SELAMANYA",(err,decoded) =>{
        if(err){
            return res.status(400).json({
                status : 0,
                message : "Token invalid",
                error :  err.message
            });
        }
        req. id = decoded
        next();
    });
};
