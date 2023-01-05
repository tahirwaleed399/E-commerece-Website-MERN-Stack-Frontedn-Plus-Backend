const express = require("express");
const {
  registerUser,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,

} = require("../Controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../MiddleWares/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:tokenId", resetPassword);
router.get("/logout", isAuthenticatedUser, logout);
// router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.get("/me", isAuthenticatedUser, getUserDetails);
router.post("/password/update", isAuthenticatedUser, updatePassword);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.get('/admin/users', isAuthenticatedUser , authorizeRoles('admin'), getAllUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

module.exports = router;
