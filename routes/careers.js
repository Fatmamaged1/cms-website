const express = require("express");
const router = express.Router();
const careerController = require("../controllers/careerController");
const { uploadFilePDF } = require("../services/upload");
const { protect, authorize } = require("../middleware/auth");

// Public reads
router.get("/", careerController.getAllCareers);
router.get("/:idOrSlug", careerController.getCareerByIdOrSlug);

// Public: anyone can apply
router.post(
  "/:id/apply",
  uploadFilePDF("resume"),
  careerController.applyToCareer
);

// Admin CRUD
router.post("/", protect, authorize("admin"), careerController.createCareer);
router.put("/:id", protect, authorize("admin"), uploadFilePDF("resume"), careerController.updateCareer);
router.delete("/:id", protect, authorize("admin"), careerController.deleteCareer);

// Admin: applications inbox
router.get("/:id/applications", protect, authorize("admin"), careerController.getAllApplicationsByCarrerId);
router.patch(
  "/:id/applications/:applicationId",
  protect,
  authorize("admin"),
  careerController.updateApplicationStatus
);

module.exports = router;
