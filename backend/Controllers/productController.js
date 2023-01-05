const Product = require("../models/productModel");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../MiddleWares/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const { name, category, stock, price, description, images } = req.body;
  //Storing Images After Uploading to CLoudinary
  let uplaodedImages = [];

  for (let i = 0; i <= images.length - 1; i++) {
    let resultUpload = await cloudinary.v2.uploader.upload(images[i].src, {
      folder: "Products",
    });

    uplaodedImages.push({
      public_id: resultUpload.public_id,
      url: resultUpload.url,
    });
  }

  let product = await Product.create({
    name,
    category,
    stock,
    price,
    description,
    images: uplaodedImages,
  });
  if (!product) {
    return next(new ErrorHandler("Cannot Create Product ", 404));
  }

  res.status(201).json({
    success: true,
    product,
  });
});

exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  const { previousImages, name, category, stock, price, description, images } =
    req.body;
  let notDelete = [];
  images.forEach((image) => {
    if (image.public_id) {
      notDelete.push(image.public_id);
    }
  });
  for (let i = 0; i <= previousImages.length - 1; i++) {
    console.log("fd");
    console.log(previousImages);
    if (!notDelete.includes(previousImages[i].public_id)) {
      await cloudinary.v2.uploader.destroy(previousImages[i].public_id)
    }
  }

let updatedImages = [];
  for(let i=0 ; i <= (images.length - 1) ; i++){
if(images[i].src.startsWith('http')){
  updatedImages.push({
    public_id : images[i].public_id,
    url : images[i].src
  });
}else{
if(images[i].public_id && !images[i].src.startsWith('http')){
  await cloudinary.v2.uploader.destroy(images[i].public_id)

}
  let resultUpload = await cloudinary.v2.uploader.upload(images[i].src,{folder: 'Products'});
  updatedImages.push({
    public_id : resultUpload.public_id,
    url : resultUpload.url
  })
}
  }
console.log(updatedImages)
  const product = await Product.findByIdAndUpdate({_id : id } , {
    name , category, stock, price, description, images :updatedImages
  }, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })
  return res.status(200).json({
    success: true,
    product,
  });
};
exports.deleteProduct = async (req, res) => {
  const id = req.params.id;
  let {images} = await Product.findById({_id:id});
  
  images.forEach(async(image)=>{
    await cloudinary.v2.uploader.destroy(image.public_id);
  })
  const product = await Product.deleteOne({ _id: id });

  return res.status(200).json({
    success: true,
    product,
  });
};
exports.getProduct = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findOne({ _id: id });

  if (!product) {
    return next(new ErrorHandler("Cannot get the Product", 404));
  }
  return res.status(200).json({
    success: true,
    product,
  });
});
exports.getAllProducts = async (req, res, next) => {
  const resultPerPage = 4;
  // http://localhost:5000/api/v1/products?page=1&price[lt]=100000&price[gte]=100
  // { page: '1', price: { lt: '100000', gte: '100' } }

  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();

  let allProducts = await apiFeatures.query;

  let filteredProductsCount = allProducts.length;

  apiFeatures.pagination(resultPerPage);

  allProducts = await apiFeatures.query.clone();

  const totalProducts = await Product.countDocuments();

  if (!allProducts) {
    return next(new ErrorHandler("Cannot get the allProducts", 404));
  }
  return res.status(200).json({
    success: true,
    allProducts,
    filteredProductsCount,
    totalProducts,
    resultPerPage,
  });
};

exports.createProductReview = catchAsyncErrors(async function (req, res, next) {
  const { rating, comment, productId } = req.body;
  if (isNaN(rating) || !productId)
    return next(new ErrorHandler("No Product Id Or Rating Given"), 400);

  if (Number(rating) > 5 || Number(rating) < 1)
    return next(
      new ErrorHandler("Rating Cannot Be Above 5 and low than 1"),
      400
    );

  const product = await Product.findById(productId).exec();

  if (!product)
  return next(new ErrorHandler(new ErrorHandler("Product Not Found"), 404));

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const user = await User.findById(req.user._id).exec();
  let tempReviews =  await user.toReview.filter((item)=>{
    console.log(item.productId)
    console.log(productId)
   return item.productId !== productId
  })
  user.toReview = tempReviews;
  
  user.save()
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    console.log('i am in else')
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.rating = avg / product.reviews.length;
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// ----------------Admin Routes-----------------
exports.getAdminProducts = catchAsyncErrors(async function (req, res, next) {
  const products = await Product.find();
  if (!products) return next(new ErrorHandler("Sorry Products Not Found"), 404);

  res.status(200).json({
    success: true,
    products,
  });
});

exports.deleteReview = catchAsyncErrors(async function (req, res, next) {
  // params needed is product Id , and review Id
  const product = await Product.findById(req.query.productId);

  if (!product) {
    new ErrorHandler("Product Not Found", 404);
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.reviewId.toString()
  );
  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let rating = 0;
  if (reviews.length === 0) {
    rating = 0;
  } else {
    rating = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      numOfReviews,
      rating,
      reviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getProductReviews = catchAsyncErrors(async function (req, res, next) {
  // params required are product id
  const product = await Product.findById(req.query.productId);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
