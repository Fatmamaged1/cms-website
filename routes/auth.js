const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validation");

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

// مثال على حماية الداشبورد
router.get("/dashboard", protect, authorize("admin"), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.name}` });
});

module.exports = router;
