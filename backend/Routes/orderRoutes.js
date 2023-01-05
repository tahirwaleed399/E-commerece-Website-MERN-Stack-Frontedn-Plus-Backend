const router = require("express").Router();
const {
    isAuthenticatedUser,
    authorizeRoles
} = require('../MiddleWares/auth');
const {
    newOrder,
    myOrders,
    getSingleOrder,
    getAllOrders,
    deleteOrder,
    updateOrder
}= require('../Controllers/orderController');


router.route('/order/new').post(isAuthenticatedUser , newOrder);
router.route('/order/me').get(isAuthenticatedUser,  myOrders )
router.route('/order/:orderId').get(isAuthenticatedUser, getSingleOrder);
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
  router
  .route("/admin/order/:orderId")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);


module.exports = router;