const jwt=require('jsonwebtoken')
const verifyToken=(req,res,next)=>{
    console.log('verifyToken middleware hit');
    const authHeader = req.headers['authorization'];
    const token=authHeader && authHeader.split(' ')[1];
    if (!token){
        return res.status(401).json({error:'Access denied. No token provided.'});
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log('Token verified, user:', decoded);
        req.user=decoded;
        next();
    }
    catch(err){
        console.log('Token verification FAILED:', err.message);
        res.status(401).json({error:'Invalid or expired token.'});
    }
};
const verifyRole=(...roles)=>{
    return (req,rs,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({error: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
};
module.exports={verifyToken,verifyRole};