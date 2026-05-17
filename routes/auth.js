const express = require("express");
const { body } = require("express-validator");
const { register, login, forgotPassword, resetPassword, getProfile, updateProfile, changePassword, uploadAvatar } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validation");
const { handleUpload } = require("../services/upload");

const router = express.Router();

router.post("/register", protect, authorize("admin"), [
  body("name").isString().trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
], validateRequest, register);

router.post("/login", [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
], validateRequest, login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Profile endpoints
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, [
  body("name").optional().isString().trim().notEmpty().withMessage("Name is required"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("phone").optional().isString().trim()
], validateRequest, updateProfile);

// Password change
router.post("/change-password", protect, [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
], validateRequest, changePassword);

// Avatar upload
router.post("/avatar", protect, handleUpload("avatar"), uploadAvatar);

// مثال على حماية الداشبورد
router.get("/dashboard", protect, authorize("admin"), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.name}` });
});

module.exports = router;
