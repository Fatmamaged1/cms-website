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

// ============================
// 🔹 POST: ربط خدمة بشركة
// ============================
router.post(
  "/:partnerId/services/:serviceId",
  protect,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { partnerId, serviceId } = req.params;

      const [partner, service] = await Promise.all([
        Partner.findById(partnerId),
        Service.findById(serviceId),
      ]);
      if (!partner) throw new NotFoundError("Partner not found");
      if (!service) throw new NotFoundError("Service not found");

      if (!partner.services.includes(serviceId)) {
        partner.services.push(serviceId);
        await partner.save();
      }
      if (!service.partners.includes(partnerId)) {
        service.partners.push(partnerId);
        await service.save();
      }

      const populated = await Partner.findById(partnerId)
        .populate("services", "title slug thumbnail excerpt")
        .lean();

      res.json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  }
);

// ============================
// 🔹 DELETE: فك ربط خدمة بشركة
// ============================
router.delete(
  "/:partnerId/services/:serviceId",
  protect,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { partnerId, serviceId } = req.params;

      const [partner, service] = await Promise.all([
        Partner.findById(partnerId),
        Service.findById(serviceId),
      ]);
      if (!partner) throw new NotFoundError("Partner not found");
      if (!service) throw new NotFoundError("Service not found");

      partner.services.pull(serviceId);
      service.partners.pull(partnerId);
      await Promise.all([partner.save(), service.save()]);

      const populated = await Partner.findById(partnerId)
        .populate("services", "title slug thumbnail excerpt")
        .lean();

      res.json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
