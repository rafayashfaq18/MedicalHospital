//Importing packages
const express = require('express');
const mongoose = require("mongoose")
const dotenv = require('dotenv');
const cors = require('cors');

//Load environment variables
dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);

//Importing files
const {user_login, verify_token} = require('./login');
const {require_admin} = require('./admin');
const admin_routes = require('./admin_routes');

//Connecting MongoDB
const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI,{
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        )
        console.log("MongoDB Connected...")
    }
    catch (error){
        console.error("MongoDB Connection Failed: ", error)
        process.exit(1)
    }
}
connectDB()

//Create an express app
const app = express();
const port = 3000;

//Middleware to parse JSON
app.use(express.json());

//Middleware to allow CORS
app.use(cors());

//Enabling admin routes
app.use('/admin', admin_routes);

//Route for user login
app.post('/login', user_login);

//Protected route that requires a valid JWT
app.get('/protected', verify_token, require_admin, (req, res) => {
    return res.status(401).json({ message: 'Admin login successful!' });
});

//Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
