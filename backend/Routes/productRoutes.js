const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  createProductReview,
  getAdminProducts,
  deleteReview,
  getProductReviews
} = require("../Controllers/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../MiddleWares/auth");

const router = express.Router();

router.route("/products").get(getAllProducts);
router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);

router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);
router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router.route("/product/:id").get(getProduct);
router
  .route("/product/review")
  .put(isAuthenticatedUser,  createProductReview);


  router.route("/reviews").delete(isAuthenticatedUser, deleteReview).get(getProductReviews);
module.exports = router;
