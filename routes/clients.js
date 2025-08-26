const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { handleUpload } = require("../services/upload");

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
router.post("/", handleUpload("logo"), clientController.createClient);

// ============================
// 🔹 PUT: تحديث عميل
// ============================
router.put("/:id", handleUpload("logo"), clientController.updateClient);

// ============================
// 🔹 DELETE: حذف عميل
// ============================
router.delete("/:id", clientController.deleteClient);

module.exports = router;
