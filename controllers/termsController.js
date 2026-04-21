const TermsConditions = require("../models/TermsConditions");

exports.createTerms = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const terms = await TermsConditions.create({ title, content });
    return res.status(201).json({ success: true, data: terms });
  } catch (error) {
    next(error);
  }
};

exports.getAllTerms = async (req, res, next) => {
  try {
    const terms = await TermsConditions.find({ isActive: true }).sort({ createdAt: -1 });
    return res.json({ success: true, terms });
  } catch (error) {
    next(error);
  }
};

exports.getTermsById = async (req, res, next) => {
  try {
    const terms = await TermsConditions.findById(req.params.id);
    if (!terms) {
      return res.status(404).json({ success: false, message: "Terms not found" });
    }
    return res.json({ success: true, data: terms });
  } catch (error) {
    next(error);
  }
};

exports.updateTerms = async (req, res, next) => {
  try {
    const terms = await TermsConditions.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!terms) {
      return res.status(404).json({ success: false, message: "Terms not found" });
    }
    return res.json({ success: true, data: terms });
  } catch (error) {
    next(error);
  }
};

exports.deleteTerms = async (req, res, next) => {
  try {
    const terms = await TermsConditions.findByIdAndDelete(req.params.id);
    if (!terms) {
      return res.status(404).json({ success: false, message: "Terms not found" });
    }
    return res.json({ success: true, data: terms });
  } catch (error) {
    next(error);
  }
};
