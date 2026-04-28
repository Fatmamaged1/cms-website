const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partnerController");
const { handleUpload } = require("../services/upload");
const { validateRequest } = require("../middleware/validation");
const { protect, authorize } = require("../middleware/auth");
const Partner = require("../models/Partner");
const Service = require("../models/Service");
const { NotFoundError } = require("../utils/errors");
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
router.post("/", protect, authorize("admin"), handleUpload("logo"), partnerController.createPartner);

// ============================
// 🔹 PUT: تحديث شركات
// ============================
router.put("/:id", protect, authorize("admin"), handleUpload("logo"), partnerController.updatePartner);

// ============================
// 🔹 DELETE: حذف شركات
// ============================
router.delete("/:id", protect, authorize("admin"), partnerController.deletePartner);

module.exports = router;
