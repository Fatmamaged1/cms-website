const Testimonial = require("../models/Testimonial");

exports.createTestimonial = async (req, res, next) => {
  try {
    const { name, content, rating } = req.body;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const icon = req.file ? `${baseUrl}/uploads/images/${req.file.filename}` : "";

    const testimonial = await Testimonial.create({ name, content, rating, icon });
    return res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

exports.getAllTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
    return res.json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
};

exports.getTestimonialById = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    return res.json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

exports.updateTestimonial = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      updateData.icon = `${baseUrl}/uploads/images/${req.file.filename}`;
    }
    if (req.body.removeIcon === "true") {
      updateData.icon = "";
    }

    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    return res.json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

exports.deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    return res.json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};
