const cron = require('node-cron');
const { sendNewBlogsEachWeekToAllContacts, sendNewServicesEachMonthToAllContacts } = require('./services/sendMail');
const ContactSubmission = require('./models/ContactSubmission');
const Blog = require('./models/Blog');
const Service = require('./models/Service');

/**
 * Weekly Blog Newsletter - كل يوم إثنين الساعة 9 صباحًا
 */

cron.schedule('0 11 * * 2', async () => {
    try {
      console.log('📧 Testing weekly blog newsletter...');
  
      const contacts = await ContactSubmission.find().select('email').lean();
      const emails = contacts.map(c => c.email);
  
      const blogs = await Blog.find({ isActive: true })
        .select('title excerpt slug featuredImage createdAt')
        .lean();
  
      console.log(`Found ${emails.length} contacts and ${blogs.length} blogs`);
  
      if (emails.length > 0 && blogs.length > 0) {
        // فقط للاختبار: يمكنك إرسال إلى إيميلك الخاص
       //  const testEmails = ['fatma.m.elessawy@gmail.com'];
         await sendNewBlogsEachWeekToAllContacts(emails, blogs.map(b => ({
            title: b.title,
            excerpt: b.excerpt,
            link: `https://yourdomain.com/blogs/${b.slug}`,
            image: b.featuredImage,
            publishDate: b.createdAt.toLocaleDateString()
          })));
          
        console.log('Newsletter sent successfully!');
      } else {
        console.log('No emails or blogs to send this week.');
      }
    } catch (err) {
      console.error('Error in weekly blog cron:', err);
    }
  });
  
/**
 * Monthly Services Newsletter - يوم 1 من كل شهر الساعة 10 صباحًا
 */
cron.schedule('0 10 1 * *', async () => {
  try {
    console.log('Running monthly services newsletter...');

    // جلب كل جهات الاتصال
    const contacts = await ContactSubmission.find().select('email').lean();
    const emails = contacts.map(c => c.email);

    // جلب آخر 30 يوم من الخدمات الجديدة
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const services = await Service.find({ isActive: true, createdAt: { $gte: oneMonthAgo } })
      .select('title description price slug featuredImage category')
      .lean();

    if (emails.length > 0 && services.length > 0) {
      await sendNewServicesEachMonthToAllContacts(emails, services.map(s => ({
        title: s.title,
        description: s.description,
        price: s.price,
        link: `https://yourdomain.com/services/${s.slug}`,
        image: s.featuredImage,
        category: s.category
      })));
    } else {
      console.log('No emails or services to send this month.');
    }
  } catch (err) {
    console.error('Error in monthly services cron:', err);
  }
});
