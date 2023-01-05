const catchAsyncErrors =  require('../MiddleWares/catchAsyncError');
const jwt = require("jsonwebtoken");
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/userModel');
exports.isAuthenticatedUser = catchAsyncErrors(async function(req , res , next){

    console.log(req);
const {token} = await req.cookies;

if(!token){
    next(new ErrorHandler("You Are Not Allowed To Access This Recource Login May The Problem Will Solve", 401));
}
 const decodedDataFromToken = jwt.verify(token, process.env.JWT_KEY);
 console.log(decodedDataFromToken);
 
    req.user = await User.findById(decodedDataFromToken.id);
next();
});


exports.authorizeRoles= (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
return next(new ErrorHandler(`Role ${req.user.role} Is Not Allowed to Access ${req.url} Recource`));
        }else{
            next();
        }
    }
}