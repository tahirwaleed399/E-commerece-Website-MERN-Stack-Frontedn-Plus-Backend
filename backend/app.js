const express = require('express');
const app = express();
var cookieParser = require('cookie-parser')
const ErrorMiddleWare = require('./MiddleWares/error');
const product =require("./routes/productRoutes");
const user =require("./routes/userRoutes");
const order =require("./routes/orderRoutes");
const payment =require("./routes/paymentRoute");
var cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
require("dotenv").config({ path: "backend/config/config.env" })
app.enable("trust proxy");
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  })); 
// app.use(express.bodyParser({limit: '50mb'}));
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
app.use(cookieParser())
app.use(fileUpload());

   
app.use("/api/v1" ,product);
app.use("/api/v1",  user);
app.use("/api/v1", order);
app.use("/api/v1", payment);
app.use(ErrorMiddleWare);

module.exports = app