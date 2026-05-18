const express = require("express");
const router = express.Router();
const careerController = require("../controllers/careerController");
const { uploadFilePDF } = require("../services/upload");
const { protect, authorize, optionalProtect } = require("../middleware/auth");

// Public reads (optional auth: shows all for admin, only published for public)
router.get("/", optionalProtect, careerController.getAllCareers);
router.get("/:idOrSlug", optionalProtect, careerController.getCareerByIdOrSlug);

// Public: anyone can apply
router.post(
  "/:id/apply",
  uploadFilePDF("resume"),
  careerController.applyToCareer
);

// Admin CRUD
router.post("/", protect, authorize("admin"), careerController.createCareer);
router.put("/:id", protect, authorize("admin"), careerController.updateCareer);
router.delete("/:id", protect, authorize("admin"), careerController.deleteCareer);

// Admin: applications inbox
router.get("/:id/applications", protect, authorize("admin"), careerController.getAllApplicationsByCarrerId);
router.get("/:id/applications/:applicationId", protect, authorize("admin"), careerController.getApplicationById);
router.patch(
  "/:id/applications/:applicationId",
  protect,
  authorize("admin"),
  careerController.updateApplicationStatus
);

module.exports = router;
