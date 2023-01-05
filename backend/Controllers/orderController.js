const catchAsyncError = require("../MiddleWares/catchAsyncError");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
// const ErrorHandler = require('../utils/errorHandler');


exports.newOrder = catchAsyncError(async function(req, res, next){
 
    const {

        shippingInfo ,
        orderItems ,
        paymentInfo,
        itemsPrice,
        taxPrice , 
        shippingPrice,  
        totalPrice,



    } = req.body ;
console.log(req.body)

    const order =await Order.create({
        shippingInfo , 
        orderItems,
        user : req.user._id,
        paymentInfo,
        paidAt : Date.now(),
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,


    });

    const user = await User.findOne({_id : req.user._id});
    await orderItems.map((item)=>{
        user.toReview.push({
            name : item.name,
            price : item.price,
            image : item.images[0].url,
            productId : item.product
        })
    });
    await user.save();

console.log(order)
    res.status(201).json({
        success: true ,
        order , 

    })

});


exports.myOrders = catchAsyncError( async function(req , res , next){
    const orders =await Order.find({user : req.user._id});

    res.status(200).json({
        success: true ,
        orders
    })
});


exports.getSingleOrder = catchAsyncError(async function(req , res , next){
    const orderId = req.params.orderId;
    const order =await Order.findById(orderId);
    if(!order) return next(new ErrorHandler("No Order Found"), 404);

    res.status(200).json({
         success : true , 
         order
    })

});


exports.getAllOrders = catchAsyncError(async function(req , res , next){
    const orders = await Order.find();
    
    res.status(200).json({
        success:true ,
        orders
    })

});

exports.deleteOrder = catchAsyncError(async function(req , res , next){
const order = await Order.findById(req.params.orderId);
if(!order){
    return next(new ErrorHandler("No Order Found with This Id"), 404);
}
await order.remove();
  res.status(200).json({
    success : true
  })
})


exports.updateOrder = catchAsyncError(async function(req , res , next){
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
      }
    
      if (order.orderStatus === "delivered") {
        return next(new ErrorHander("You have already delivered this order", 400));
      }

      if(req.body.status === 'shipped'){
        order.orderItems.forEach(async (order)=>{
           await  update(order.product , order.quantity );
        })
        
  if (req.body.status === "delivered") {
    order.deliveredAt = Date.now();
  }
      }
      order.orderStatus = req.body.status;


      await order.save({validateBeforeSave:false});
      res.status(200).json({
        success: true,
      });
   
    
})

async function update(productId , qty ){

    const product = await Product.findById(productId).exec();
   if(product){
    product.stock -= qty;
    await product.save({validateBeforeSave:false})
   }
}