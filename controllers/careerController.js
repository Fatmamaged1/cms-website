const Career = require("../models/Career");
const JobApplication = require("../models/JobApplication");
const path = require("path");
const mongoose = require("mongoose");
const slugify = require("slugify");
const { sendCareerApplicationConfirmationEmail } = require("../services/sendMail");
const { APPLICATION_STATUS } = require("../constants/applicationStatus");
const { buildFileUrl } = require("../utils/imageUrl");
// إنشاء وظيفة جديدة
exports.createCareer = async (req, res, next) => {
  try {
    const { title, department, jobType, workType, location, experienceLevel, applicationDeadline } = req.body;

    const career = await Career.create({
      ...req.body,
      slug: slugify(title, { lower: true }),
      applicationDeadline: new Date(applicationDeadline)
    });

    return res.status(201).json({ success: true, data: career });
  } catch (error) {
    next(error);
  }
};


exports.getAllCareers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (status) {
      filter.status = status;
    } else if (!req.user) {
      filter.status = "published";
    }

    const fieldsToSelect = [
      "title",
      "department",
      "jobType",
      "workType",
      "location",
      "createdAt",
      "salary",
      "seo",
      "_id",
      "language",
      "isActive",
      "slug",
      "contentType"
    ].join(" ");

    const [careers, total] = await Promise.all([
      Career.find(filter)

        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select(fieldsToSelect), // حدد الحقول
      Career.countDocuments(filter),
    ]);
const enhancedCareers = careers.map(career => {
      const data = career.toObject();

      return data;
    });

    return res.json({
      success: true,
      total,
      currentPage: Number(page),
      pages: Math.ceil(total / limit),
      data: enhancedCareers,
    });
  } catch (error) {
    next(error);
  }
};


// عرض وظيفة واحدة حسب ID أو Slug
exports.getCareerByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const query = isObjectId
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    if (!req.user && !isObjectId) {
      query.status = "published";
    }

    const career = await Career.findOne(query);

    if (!career) {
      return res.status(404).json({ success: false, message: "الوظيفة غير موجودة" });
    }

    return res.json({ success: true, data: career });
  } catch (error) {
    next(error);
  }
};
// تقديم طلب توظيف
exports.applyToCareer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, message } = req.body;

    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({ success: false, message: "الوظيفة غير موجودة" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "السيرة الذاتية مطلوبة" });
    }

    const application = await JobApplication.create({
      job: id,
      fullName,
      email,
      phone,
      resume: req.file.path,
      message
    });

    const job = await Career.findById(req.params.id).select("title location");

    const resumeUrl = buildFileUrl(req, path.basename(application.resume));
    try {
      await sendCareerApplicationConfirmationEmail(email, {
        fullName,
        email,
        phone,
        message,
        resumeUrl,
        job
      });
    } catch (emailErr) {
      console.error("Failed to send career application email (application saved):", emailErr.message);
    }
    res.status(201).json({
      success: true,
      message: "تم تقديم طلب التوظيف بنجاح",
      data: {
        id: application._id,
        fullName: application.fullName,
        email: application.email,
        phone: application.phone,
        resumeUrl,
        status: application.status,
        score: application.score,
        matchingPercentage: application.matchingPercentage,
        source: application.source,
        createdAt: application.createdAt,
        job: {
          id: job?._id,
          title: job?.title,
          location: job?.location,
        }
      }
    });
  } catch (error) {
    // تحقق من تكرار القيم
    if (error.code === 11000) { // E11000 duplicate key error
      return res.status(400).json({
        success: false,
        message: "لقد تقدمت لهذه الوظيفة بالفعل بهذا البريد الإلكتروني",
        errors: Object.keys(error.keyValue).map(field => ({
          field,
          message: `هذا ${field} مستخدم بالفعل`,
          value: error.keyValue[field]
        }))
      });
    }
    next(error);
  }
};
//update career
// تحديث وظيفة
exports.updateCareer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid career ID format"
      });
    }

    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({
        success: false,
        message: "الوظيفة غير موجودة"
      });
    }

    const allowedFields = [
      'title', 'department', 'jobType', 'workType', 'location',
      'experienceLevel', 'requiredSkills', 'preferredSkills',
      'salary', 'description', 'requirements', 'responsibilities',
      'benefits', 'applicationDeadline', 'applicationUrl',
      'status', 'language', 'seo'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'title' && req.body.title) {
          career.title = req.body.title;
          career.slug = slugify(req.body.title, { lower: true });
        } else if (field === 'applicationDeadline') {
          career.applicationDeadline = new Date(req.body.applicationDeadline);
        } else {
          career[field] = req.body[field];
        }
      }
    }

    await career.save();

    return res.json({
      success: true,
      message: "تم تحديث الوظيفة بنجاح",
      data: career
    });
  } catch (error) {
    next(error);
  }
};




exports.deleteCareer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({
        success: false,
        message: "الوظيفة غير موجودة"
      });
    }

    await Career.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "تم حذف الوظيفة بنجاح"
    });

  } catch (error) {
    next(error);
  }
};

exports.getAllApplicationsByCarrerId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid career ID format" });
    }

    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({ success: false, message: "Career not found" });
    }

    const applications = await JobApplication.find({ job: id })
      .populate("job", "title slug")
      .lean();

    const enhancedApplications = applications.map(app => ({
      ...app,
      resume: app.resume
        ? buildFileUrl(req, path.basename(app.resume))
        : null
    }));

    return res.json({
      success: true,
      count: enhancedApplications.length,
      data: enhancedApplications
    });
  } catch (error) {
    next(error);
  }
};

// Get single application by ID
exports.getApplicationById = async (req, res, next) => {
  try {
    const { id, applicationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid career ID format" });
    }

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ success: false, message: "Invalid application ID format" });
    }

    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({ success: false, message: "Career not found" });
    }

    const application = await JobApplication.findOne({ _id: applicationId, job: id })
      .populate("job", "title slug _id")
      .lean();

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Build full resume URL
    const enhancedApplication = {
      ...application,
      resume: application.resume
        ? buildFileUrl(req, path.basename(application.resume))
        : null
    };

    return res.json({
      success: true,
      data: enhancedApplication
    });
  } catch (error) {
    next(error);
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id, applicationId } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = Object.values(APPLICATION_STATUS);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values are: ${validStatuses.join(", ")}`
      });
    }

    // Check if career exists
    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({ success: false, message: "Career not found" });
    }

    // Find and update application
    const application = await JobApplication.findOne({ _id: applicationId, job: id });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Add to status history
    application.statusHistory.push({
      status: application.status,
      changedAt: new Date(),
      changedBy: req.user?._id || null,
      notes: notes || `Status changed from ${application.status} to ${status}`
    });

    // Update current status
    application.status = status;
    await application.save();

    return res.json({
      success: true,
      message: "Application status updated successfully",
      data: {
        id: application._id,
        status: application.status,
        statusHistory: application.statusHistory
      }
    });
  } catch (error) {
    next(error);
  }
};
