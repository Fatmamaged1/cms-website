const Partner = require("../models/Partner");
const slugify = require("slugify");
exports.createPartner = async (req, res, next) => {
    try {
        const { name, logo, brief, url, services } = req.body;
        const partner = await Partner.create({
            name,
            logo,
            brief,
            url,
            services,
            slug: slugify(name, { lower: true })
        });
        return res.status(201).json({ success: true, data: partner });
    } catch (error) {
        next(error);
    }
};

exports.getAllPartners = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * Number(limit);
        const [partners, total] = await Promise.all([
            Partner.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            Partner.countDocuments()
        ]);
        return res.json({ success: true, data: partners, meta: { page: Number(page), limit: Number(limit), total } });
    } catch (error) {
        next(error);
    }
};

exports.getPartnerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const partner = await Partner.findById(id);
        if (!partner) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }
        return res.json({ success: true, data: partner });
    } catch (error) {
        next(error);
    }
};

exports.updatePartner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const partner = await Partner.findByIdAndUpdate(id, req.body, { new: true });
        if (!partner) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }
        return res.json({ success: true, data: partner });
    } catch (error) {
        next(error);
    }
};

exports.deletePartner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const partner = await Partner.findByIdAndDelete(id);
        if (!partner) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }
        return res.json({ success: true, data: partner });
    } catch (error) {
        next(error);
    }
};

exports.getAllPartnersByServiceId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const partners = await Partner.find({ services: id });
        return res.json({ success: true, data: partners });
    } catch (error) {
        next(error);
    }
};