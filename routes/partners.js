const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partnerController");
const { handleUpload } = require("../services/upload");
const { validateRequest } = require("../middleware/validation");
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
router.post("/", handleUpload("logo"), partnerController.createPartner);

// ============================
// 🔹 PUT: تحديث شركات
// ============================
router.put("/:id", handleUpload("logo"), partnerController.updatePartner);

// ============================
// 🔹 DELETE: حذف شركات
// ============================
router.delete("/:id", partnerController.deletePartner); 

async function addPartnersToService(serviceId, partnerId) {
    try {
      const partner = await Partner.findById(partnerId);
      if (!partner) {
        throw new NotFoundError('Partner not found');
      }
  
      // لو الـ _id عندك String
      const service = await Service.findOne({ _id: serviceId });
      if (!service) {
        throw new NotFoundError('Service not found');
      }
  
      service.partners = service.partners || [];
      partner.services = partner.services || [];
  
      service.partners.push(partnerId);
      await service.save();
  
      partner.services.push(serviceId);
      await partner.save();
  
      return service;
    } catch (error) {
      console.error('Error adding partner to service:', error);
      return null;
    }
  }
  

router.post(
    '/:serviceId/partners/:partnerId',
    
    async (req, res, next) => {
      try {
        const { serviceId, partnerId } = req.params;
        console.log(serviceId, partnerId);
        const service = await addPartnersToService(serviceId, partnerId);
        if (!service) {
          throw new NotFoundError('Service not found');
        }
        res.json({
          success: true,
          message: 'Partner added to service successfully',
          data: service
        });
      } catch (error) {
        next(error);
      }
    }
  );
module.exports = router;
