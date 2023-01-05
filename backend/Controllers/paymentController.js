require("dotenv").config({ path: "backend/config/config.env" })
const catchAsyncErrors = require("../MiddleWares/catchAsyncError");

const Stripe = require('stripe');
const stripe = Stripe('sk_test_51LYxZZLccdpUw7HoGI2eJm5u25EO5kKmUuCiQ85tEXqfCgmRlkfhLgQL2cx5Kx3K0R0bIeKDHrzMjb00ISUiZQlY00WybKewjr');
exports.processPayment  = catchAsyncErrors(async (req , res, next )=>{

const {client_secret} =  await stripe.paymentIntents.create({
    amount :  req.body.amount , 
    currency :'usd'
}
);

res.status(200).json({
    success : true ,
    client_secret
})
})

exports.getStripeApiKeys = catchAsyncErrors(async (req , res , next)=>{
    
    res.status(200).json({
        success : true  ,
        stripeApiKey: process.env.STRIPE_API_KEY

    })
})