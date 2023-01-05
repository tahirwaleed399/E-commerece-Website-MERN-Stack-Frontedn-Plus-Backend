const User = require("../models/userModel");
const catchAsyncErrors = require("../MiddleWares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { sendToken } = require("../utils/jwtToken");
const sendEmail = require("../utils/sendMail");
const cloudinary = require('cloudinary');
const crypto = require("crypto");
exports.registerUser = catchAsyncErrors(async function (req, res, next) {
  const { name, email, password ,avatar} = req.body;
  let  resultUpload=  null; 

if(avatar.length > 5){
  resultUpload = await cloudinary.v2.uploader.upload(avatar,{folder: 'Avatars',  width: 150,
  crop: "scale",})
}
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id:resultUpload ? resultUpload.public_id: null ,
      url: resultUpload ? resultUpload.url: null ,
    },


  });
  sendToken(user, 200, res);
});

exports.login = catchAsyncErrors(async function (req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("No Email OR Password Given", 400));
  }
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    next(new ErrorHandler("Invalid Email Or PAssword ", 400));
  }
  const isPasswordTrue = await user.comparePasswords(password);
  if (!isPasswordTrue) {
    return next(new ErrorHandler("Invalid Password Or Email", 400));
  }
  sendToken(user, 200, res);
});

exports.logout = catchAsyncErrors(async function (req, res, next) {
  res
    .status(200)
    .cookie("token", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User Successfully Logged Out",
    });
});

exports.forgotPassword = catchAsyncErrors(async function (req, res, next) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    const originalToken = await user.getResetPasswordToken();
    await user.save();
    const requestUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${originalToken}`;
    const info = await sendEmail(
      email,
      "Reset Password",
      `Reset Email`,
      `<h1 style='color : green;'>Click The Link To Reset Your Account Password At Ahmad Mobiez<br>
<a href="${requestUrl}">Click Here To Reset Password</a>
</h1>`
    );

    res.status(200).json({
      success: true,
      message: "Successfully Forgot Checkout Your Email For Further Details",
    });
    next();
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

exports.resetPassword = catchAsyncErrors(async function (req, res, next) {
  const originalToken = req.params.tokenId;
  const hashedToken = crypto
    .createHash("sha256")
    .update(originalToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler("Reset Token Expired Or Expired", 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not password", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.save();

  //  await User.updateOne({_id : user._id} , {
  //     password : user.password,
  //     resetPasswordExpire:undefined,
  //     resetPasswordToken:undefined

  //   });
  sendToken(user, 200, res);
});

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user =await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});


exports.updatePassword = catchAsyncErrors(
  async (req, res , next)=>{
    const {oldPassword , newPassword , confirmNewPassword} = req.body;
    
    const user =await User.findById(req.user.id).select('+password');
  const matchOldPassword = user.comparePasswords(oldPassword);
  if (!matchOldPassword) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }
  
  if (req.body.newPassword !== req.body.confirmNewPassword) {
    return next(new ErrorHandler("password does not match", 400));
  }
  
  user.password = confirmNewPassword;
  
  await user.save();

  sendToken(user , 200 , res);
    

  }
)


exports.updateProfile= catchAsyncErrors(
  async function(req, res, next){



    const {email , name, avatar} = req.body;
    const {avatar : prevAvatar}= req.user ;
    let resultUpload = avatar.startsWith('http')? prevAvatar : null ;
if(!avatar.startsWith('http') && avatar.length > 5){
if(prevAvatar.url){
  await cloudinary.v2.uploader.destroy(prevAvatar.public_id);
}
  resultUpload = await cloudinary.v2.uploader.upload(avatar,{folder: 'Avatars',  width: 150,
  crop: "scale",})
}



  let user=    await User.findOneAndUpdate({_id: req.user._id} , {email, name , avatar: {
    public_id : resultUpload ? resultUpload.public_id : null ,
    url : resultUpload ? resultUpload.url : null }}, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

      res.status(200).json({
        success: true,
        user  
      });

  

 }
)

// ---------------------------------------ADMIN ROUTES -----------------------------------------


exports.getAllUsers = catchAsyncErrors(async function(req , res , next){

  const users = await  User.find();
if(!users){
  return  next( new ErrorHandler('Users Not Found'), 404);

}
res.status(200).json({
  success : true ,
users
})
});



exports.getSingleUser = catchAsyncErrors(
  async function(req , res , next){
    const id = req.params.id;
    const user = await User.findById(id);
    if(!user){
      return next(new ErrorHandler("No User found"), 404);
    }
    res.status(200).json({
      success : true ,
      user
    })
  }
)


exports.updateUserRole = catchAsyncErrors(async function(req , res , next){
  const id = req.params.id;
  const role = req.body.role;
  if(!['admin', 'user'].includes(role)){
    return next(new ErrorHandler('Role is Invalid'), 400);
  }
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  await User.findByIdAndUpdate(id ,newUserData, {new : true} )
  res.status(200).json({
    success : true ,
  })

});

exports.deleteUser = catchAsyncErrors(async function(req, res,next){
  const id = req.params.id;
  
  await User.findByIdAndDelete(id);
  res.status(200).json({
    success : true ,
  })

})