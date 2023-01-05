const app= require('./app');
const dotenv =require('dotenv');
const connectMogngoDb = require('./database');
const cloudinary = require("cloudinary");
dotenv.config({path:'./config/config.env'});

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});
connectMogngoDb();
const server = app.listen(process.env.PORT , (req,res)=>{
    console.log('listening on ' + process.env.PORT  );
    
});
 