const Service = require('../models/Service');
const Blog = require('../models/Blog');
const Career = require('../models/Career');
const Partner = require('../models/Partner');
const Client = require('../models/Client');
const Testimonial = require('../models/Testimonial');
const JobApplication = require('../models/JobApplication');
const ContactSubmission = require('../models/ContactSubmission');
const User = require('../models/User');

exports.getOverview = async (req, res, next) => {
  try {
    const [
      services,
      blogs,
      careers,
      partners,
      clients,
      testimonials,
      applications,
      messages,
      users,
    ] = await Promise.all([
      Service.find().lean(),
      Blog.find().lean(),
      Career.find().lean(),
      Partner.find().lean(),
      Client.find().lean(),
      Testimonial.find().lean(),
      JobApplication.find().sort({ createdAt: -1 }).limit(10).populate('job', 'title').lean(),
      ContactSubmission.find().lean(),
      User.find().lean(),
    ]);

    const data = {
      content: {
        services: {
          total: services.length,
          published: services.filter((s) => s.isActive !== false).length,
          draft: services.filter((s) => s.isActive === false).length,
          featured: services.filter((s) => s.featured).length,
        },
        blogs: {
          total: blogs.length,
          published: blogs.filter((b) => b.status === 'published').length,
          draft: blogs.filter((b) => b.status === 'draft').length,
          archived: blogs.filter((b) => b.status === 'archived').length,
        },
        careers: {
          total: careers.length,
          open: careers.filter((c) => c.status === 'published').length,
          closed: careers.filter((c) => c.status === 'closed').length,
          draft: careers.filter((c) => c.status === 'draft').length,
          archived: careers.filter((c) => c.status === 'archived').length,
          byDepartment: aggregateCount(careers, 'department'),
          byJobType: aggregateCount(careers, 'jobType'),
          byWorkType: aggregateCount(careers, 'workType'),
          byExperienceLevel: aggregateCount(careers, 'experienceLevel'),
        },
        partners: { total: partners.length },
        clients: { total: clients.length },
        testimonials: {
          total: testimonials.length,
          active: testimonials.filter((t) => t.isActive).length,
        },
        applications: {
          total: await JobApplication.countDocuments(),
          byStatus: aggregateCount(await JobApplication.find().lean(), 'status'),
          recent: applications.map((a) => ({
            _id: a._id,
            careerId: a.job?._id,
            fullName: a.fullName,
            jobTitle: a.job?.title || 'Unknown',
            status: a.status,
            createdAt: a.createdAt,
          })),
        },
        messages: {
          total: messages.length,
          unread: messages.filter((m) => !m.isRead).length,
          byStatus: aggregateCount(messages, 'status'),
        },
      },
      users: {
        total: users.length,
        byRole: aggregateCount(users, 'role'),
      },
    };

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

function aggregateCount(arr, field) {
  const map = {};
  for (const item of arr) {
    const val = item[field];
    if (val) map[val] = (map[val] || 0) + 1;
  }
  return map;
}
