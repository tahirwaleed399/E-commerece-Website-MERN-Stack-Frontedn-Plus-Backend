const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter The Product Name"],
  },
  description: {
    type: String,
    required: [true, "Please Enter The Product description"],
  },
  price: {
    type: Number,
    required: [true, "Please Enter The Product price"],
    maxLength: [8, "Price cannot exceed 8 characters"],
  },
  rating: {
    type: Number,
    default: 0,
  },
  images: {
    type : [ {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    }],
    required:[true , 'Product Should Contain At least One Image']
  },
  category: {
    type: String,
    required: [true, "Please Enter Product Category"],
  },
  stock: {
    type: Number,
    required: [true, "Please Enter the Product Stocks"],
    maxLength: [5, "Stock cannot Exceeed 5 characters"],
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews:{    type : [
{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      
    },
  ],
default : [],
},

//   user: {
//     type: mongoose.Schema.ObjectId,
//     ref: "User",
//     required: true,
//   },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports= mongoose.model('Product',productSchema);