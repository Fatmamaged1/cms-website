const PrivacyPolicy = require("../models/PrivacyPolicy");

exports.createPrivacy = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const privacy = await PrivacyPolicy.create({ title, content });
    return res.status(201).json({ success: true, data: privacy });
  } catch (error) {
    next(error);
  }
};

exports.getAllPrivacy = async (req, res, next) => {
  try {
    const policies = await PrivacyPolicy.find({ isActive: true }).sort({ createdAt: -1 });
    return res.json({ success: true, policies });
  } catch (error) {
    next(error);
  }
};

exports.getPrivacyById = async (req, res, next) => {
  try {
    const privacy = await PrivacyPolicy.findById(req.params.id);
    if (!privacy) {
      return res.status(404).json({ success: false, message: "Privacy policy not found" });
    }
    return res.json({ success: true, data: privacy });
  } catch (error) {
    next(error);
  }
};

exports.updatePrivacy = async (req, res, next) => {
  try {
    const privacy = await PrivacyPolicy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!privacy) {
      return res.status(404).json({ success: false, message: "Privacy policy not found" });
    }
    return res.json({ success: true, data: privacy });
  } catch (error) {
    next(error);
  }
};

exports.deletePrivacy = async (req, res, next) => {
  try {
    const privacy = await PrivacyPolicy.findByIdAndDelete(req.params.id);
    if (!privacy) {
      return res.status(404).json({ success: false, message: "Privacy policy not found" });
    }
    return res.json({ success: true, data: privacy });
  } catch (error) {
    next(error);
  }
};
