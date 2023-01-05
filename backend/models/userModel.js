const mongoose = require("mongoose");
var validator = require('validator');
var bcrpyt= require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : [true , " Please Enter The Name"]
    },
    email :{
        type : String ,
        required : [true , "Please Enter The Email"],
        validate : [validator.isEmail, "Please Enter a Valid Email"],
        unique : true 
    },
    password : {
        type:String ,
        minLength :[8,"Password Cannot less than 5 Chars"],
        maxLength : [100 , "Password Cannot Increase 100 Chars"],
        required : [true , "Please Enter The Passowrd"],
        select : false
    }
    , avatar :  {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
      role: {
        type : String ,
default:'user'
      },
      
    createdAt: {
    type: Date,
    default: Date.now,
  },

  toReview : {
    type : [ 
      {
        name : String ,
        price : Number,
        image : String ,
        productId : String ,
      }
    ],
    default:[]
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,

});


userSchema.pre("save",async function(next){
    if(!this.isModified('password')){
        next();
    };
    console.log(validator.isEmail(this.email));
    
    
    this.password = await bcrpyt.hash(this.password , 10);

})
userSchema.methods.comparePasswords =async function(enteredPassword){

    return await bcrpyt.compare(enteredPassword , this.password)
}
userSchema.methods.getJwtToken = async function (){
    return jwt.sign({id: this.id}, process.env.JWT_KEY , {
        expiresIn: process.env.JWT_EXPIRE,
      })
}

userSchema.methods.getResetPasswordToken= async function (){

  console.log('get reset password token');
  const passwordToken =await crypto.randomBytes(16).toString('hex');
  this.resetPasswordToken=   crypto
    .createHash("sha256")
    .update(passwordToken)
    .digest("hex");

  this.resetPasswordExpire =Date.now() + (process.env.RESET_PASSWORD_EXPIRE_TIME *60 *1000);


  return passwordToken;
  // console.log(new Date(this.resetPasswordToken));

  

  
  

}

module.exports = mongoose.model('User', userSchema);