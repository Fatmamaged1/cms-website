const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { handleUpload } = require("../services/upload");
const { protect, authorize } = require("../middleware/auth");

// ============================
// 🔹 GET: جميع العملاء
// ============================
router.get("/", clientController.getAllClients);

// ============================
// 🔹 GET: عميل واحد عبر ID
// ============================
router.get("/:id", clientController.getClientById);

// ============================
// 🔹 POST: إنشاء عميل جديد
// ============================
router.post("/", protect, authorize("admin"), handleUpload("logo"), clientController.createClient);

// ============================
// 🔹 PUT: تحديث عميل
// ============================
router.put("/:id", protect, authorize("admin"), handleUpload("logo"), clientController.updateClient);

// ============================
// 🔹 DELETE: حذف عميل
// ============================
router.delete("/:id", protect, authorize("admin"), clientController.deleteClient);

module.exports = router;
