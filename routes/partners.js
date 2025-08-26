const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partnerController");
const { handleUpload } = require("../services/upload");

// ============================
// 🔹 GET: جميع الشركات
// ============================
router.get("/", partnerController.getAllPartners);

// ============================
// 🔹 GET: شركات واحد عبر ID
// ============================
router.get("/:id", partnerController.getPartnerById);

// ============================
// 🔹 POST: إنشاء شركات جديد
// ============================
router.post("/", handleUpload("logo"), partnerController.createPartner);

// ============================
// 🔹 PUT: تحديث شركات
// ============================
router.put("/:id", handleUpload("logo"), partnerController.updatePartner);

// ============================
// 🔹 DELETE: حذف شركات
// ============================
router.delete("/:id", partnerController.deletePartner);

module.exports = router;
