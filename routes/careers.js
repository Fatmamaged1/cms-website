const express = require("express");
const router = express.Router();
const careerController = require("../controllers/careerController");
const{ uploadFilePDF} = require("../services/upload");

// ============================
// 🔹 GET: جميع الوظائف مع فلاتر
// ============================
router.get("/", careerController.getAllCareers);

// ============================
// 🔹 GET: وظيفة واحدة عبر ID أو Slug
// ============================
router.get("/:idOrSlug", careerController.getCareerByIdOrSlug);

// ============================
// 🔹 POST: إنشاء وظيفة جديدة
// ============================
router.post("/", careerController.createCareer);

// =======================================
// 🔹 POST: تقديم طلب توظيف على وظيفة معينة
// =======================================
router.post(
  "/:id/apply",
    uploadFilePDF("resume"), // ⚠️ تأكد أن اسم الحقل في الفورم هو "resume"
  careerController.applyToCareer
);

// ============================
// 🔹 PUT: تحديث وظيفة
// ============================
router.put("/:id",uploadFilePDF("resume"), careerController.updateCareer);

// ============================
// 🔹 DELETE: حذف وظيفة
// ============================
router.delete("/:id", careerController.deleteCareer);

// ============================
// 🔹 GET: جميع الطلبات
// ============================
router.get("/:id/applications", careerController.getAllApplicationsByCarrerId);

module.exports = router;
