//Importing packages
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

//Load environment variables
dotenv.config();

//Secret key for signing JWTs (should be in environment variables for security)
const secret_key = process.env.JWT_SECRET;

//Importing schemas to access admin
const {Users} = require('./schemas');

//Function for user login
const user_login = async (req, res) => {
    try{
        const {email, password} = req.body;

        //Find user by email and password
        const user = await Users.findOne({email: email.toLowerCase()});

        //If email doesnt match, return 401 Unauthorized
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        //If user found, check the password. If password doesnt match, return 401 Unauthorized
        const password_check = await bcrypt.compare(password, user.password);
        if(!password_check){
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        //Check this user has admin perms
        if(user.role !== 'Admin' || user.status !== 'Approved'){
            return res.status(401).json({ message: 'Access denied: ' });
        }

        //Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret_key, { expiresIn: '1h' });

        //Return token
        res.json({message: "Login successful", token });
    }
    catch(err){
        console.error("Error logging in: ",err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

//Middleware to verify JWT token
const verify_token = (req, res, next) => {
    const tokeninit = req.headers['authorization'];

    //If token is missing, return 403
    if (!tokeninit) {
        return res.status(403).json({ message: 'No token provided' });
    }

    //Check if token format is correct
    const parts = tokeninit.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(403).json({ message: 'Token format is invalid' });
    }
    
    const token = parts[1];

    //Verify token
    jwt.verify(token, secret_key, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = {user_login, verify_token}
