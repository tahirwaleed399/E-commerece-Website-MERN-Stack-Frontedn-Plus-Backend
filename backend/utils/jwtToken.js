exports.sendToken= async function(user  , statusCode,res)    {

const token = await user.getJwtToken();


res.cookie("token", token, {
    httpOnly :true ,
    secure:false ,
    expires : new Date(
        Date.now() +  process.env.COOKIE_EXPIRE *24 *60*60*1000
    )
});

res.status(statusCode).json({
    success : true , 
    user ,
    token
})
}

// cookie("token",token , {
//     httpOnly :true ,
   
// })
