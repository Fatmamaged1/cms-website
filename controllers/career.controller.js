const Career = require("../models/Career");
const JobApplication = require("../models/JobApplication");
const slugify = require("slugify");

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

// استرجاع جميع الوظائف مع فلاتر
exports.getAllCareers = async (req, res, next) => {
  try {
    const { search, status = 'published', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (status) {
      filter.status = status;
    }

    const [careers, total] = await Promise.all([
      Career.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Career.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      total,
      currentPage: Number(page),
      pages: Math.ceil(total / limit),
      data: careers,
    });
  } catch (error) {
    next(error);
  }
};

// عرض وظيفة واحدة حسب ID أو Slug
exports.getCareerByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const query = /^[0-9a-fA-F]{24}$/.test(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

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


    // جلب بيانات الوظيفة
    const job = await Career.findById(req.params.id).select("title location slug");
    
    // بناء رابط للسيرة الذاتية
    const resumeUrl = `${req.protocol}://${req.get("host")}/uploads/images/${path.basename(jobApplication.resume)}`;
    
    // إعادة الاستجابة المحسنة
    res.status(201).json({
      success: true,
      message: "تم تقديم طلب التوظيف بنجاح",
      data: {
        id: jobApplication._id,
        fullName: jobApplication.fullName,
        email: jobApplication.email,
        phone: jobApplication.phone,
        resumeUrl,
        status: jobApplication.status,
        score: jobApplication.score,
        matchingPercentage: jobApplication.matchingPercentage,
        source: jobApplication.source,
        createdAt: jobApplication.createdAt,
        job: {
          id: job?._id,
          title: job?.title,
          location: job?.location,
          slug: job?.slug,
          url: `/careers/${job?.slug || job?._id}`
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
