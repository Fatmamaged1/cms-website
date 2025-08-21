const express = require("express");
const { register, login } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// مثال على حماية الداشبورد
router.get("/dashboard", protect, authorize("admin"), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.name}` });
});

module.exports = router;
