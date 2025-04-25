function require_admin(req,res,next){
    if(!req.user || req.user.role!=='Admin'){
        return res.status(401).json({ message: 'Authentication required' });
    }

    next();
}

module.exports = {require_admin};