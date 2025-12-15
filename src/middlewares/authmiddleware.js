const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey';


const authenticate = (req,res,next)=>{
    const token = req.header('Authorization')?.replace('Bearer ','');

    if(!token){
        return res.status(401).json({
             message: 'Access denied. No token provided.' });
    }

    try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (error) {
    res.status(401).json({
      success:false, 
      message: 'Invalid token',
      error:error.message
     });
  }
}

module.exports=authenticate