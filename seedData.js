require('dotenv').config();
const mongoose = require('mongoose');

// Models
const About = require('./models/About');
const Partner = require('./models/Partner');
const Client = require('./models/Client');
const Service = require('./models/Service');
const Blog = require('./models/Blog');
const PageContent = require('./models/PageContent');
const GlobalSettings = require('./models/GlobalSettings');
const Testimonial = require('./models/Testimonial');
const TermsConditions = require('./models/TermsConditions');
const PrivacyPolicy = require('./models/PrivacyPolicy');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cmsDB';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // ──────────────────────────────────────────────
  // 1. CLEAR EXISTING DATA
  // ──────────────────────────────────────────────
  const db = mongoose.connection.db;
  const collections = ['abouts', 'partners', 'clients', 'content', 'globalsettings', 'testimonials', 'termsconditions', 'privacypolicies'];
  for (const col of collections) {
    try { await db.collection(col).deleteMany({}); } catch (e) { /* collection may not exist */ }
  }
  console.log('Cleared existing data');

  // ──────────────────────────────────────────────
  // 2. GLOBAL SETTINGS
  // ──────────────────────────────────────────────
  await GlobalSettings.create({
    siteName: 'PRE-MED',
    siteTagline: 'Your Premium Medical Solution',
    logo: {
      altText: 'PRE-MED — Your Premium Solution',
    },
    contact: {
      email: 'info@premedsolution.com',
      address: {
        street: '3813 King Abdulaziz Rd, Al Wizarat',
        city: 'Riyadh',
        state: 'Riyadh Province',
        postalCode: '12622',
        country: 'Saudi Arabia',
      },
    },
    socialMedia: [
      { platform: 'linkedin', url: 'https://linkedin.com/company/premedsolution', isActive: true },
    ],
    seo: {
      defaultMetaTitle: 'PRE-MED — Your Premium Medical Solution',
      defaultMetaDescription: "Saudi Arabia's trusted partner for premium orthopedic implants, surgical systems, and clinical excellence – powering better patient outcomes across the Kingdom and beyond.",
      defaultMetaKeywords: [
        'orthopedic implants', 'surgical systems', 'medical devices', 'Saudi Arabia',
        'PRE-MED', 'SFDA', 'arthroplasty', 'trauma', 'spine', 'sports medicine',
      ],
      canonicalUrl: 'https://www.premedsolution.com',
    },
    localization: {
      defaultLanguage: 'en',
      availableLanguages: [
        { code: 'en', name: 'English', isDefault: true, isActive: true },
        { code: 'ar', name: 'العربية', isDefault: false, isActive: true },
      ],
      timezone: 'Asia/Riyadh',
    },
  });
  console.log('Global settings seeded');

  // ──────────────────────────────────────────────
  // 3. HOME PAGE
  // ──────────────────────────────────────────────
  await PageContent.create({
    pageType: 'home',
    language: 'en',
    isActive: true,
    slug: 'home',
    sections: {
      hero: {
        title: 'PRE-MED: Your Premium Medical Solution',
        subtitle: "Saudi Arabia's trusted partner for premium orthopedic implants, surgical systems, and clinical excellence – powering better patient outcomes across the Kingdom and beyond.",
        backgroundImage: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?w=1920&q=80',
        ctaText: 'Request a Meeting',
        ctaLink: '/contact',
      },
      about: {
        title: 'About Premium Medical Solutions Company',
        subtitle: 'COMPANY PROFILE',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80',
        content: JSON.stringify({
          paragraph1: 'Premium Medical Solutions Company (PRE-MED) is a Saudi-based healthcare distributor dedicated to advancing medical care across the Kingdom and the Middle East. Since our founding in 2020, we have built a strong reputation for delivering high-quality medical solutions, technical expertise, and reliable service to healthcare providers throughout the region.',
          paragraph2: 'Initially established to serve the orthopedic sector, PRE-MED has grown into a trusted partner for hospitals and surgeons – offering a comprehensive range of implants, instruments, and surgical accessories. Building on this foundation, we are strategically expanding our portfolio to include additional medical specialties, broadening our ability to meet the evolving needs of the healthcare industry.',
          whyPreMed: [
            'Headquartered in Riyadh, operating nationwide',
            'Regulatory excellence with SFDA-compliant processes',
            'Responsive logistics with a robust inventory buffer',
            'Strong global manufacturing partnerships',
            'Focused on optimal patient outcomes',
          ],
        }),
      },
      features: [
        { title: '2020', subtitle: 'Year Founded', content: 'Building trust from day one', order: 0 },
        { title: '8+', subtitle: 'Exclusive Global Partners', content: 'World-class manufacturers', order: 1 },
        { title: '3', subtitle: 'Key Cities', content: 'Riyadh · Dammam · Jeddah', order: 2 },
        { title: '100%', subtitle: 'SFDA Compliant', content: 'Regulatory excellence guaranteed', order: 3 },
        { title: '99.8%', subtitle: 'On-Time Delivery', content: 'Consistently meeting surgical schedules across all regions', order: 4 },
        { title: '99.5%', subtitle: 'Order Accuracy', content: 'Precision picking and verification protocols', order: 5 },
      ],
      services: {
        title: 'Product Portfolio Overview',
        subtitle: "PRE-MED offers full orthopedic coverage across all major subspecialties – backed by clinical training, technical expertise, and the most trusted global manufacturers in the field.",
      },
    },
    seo: {
      metaTitle: 'PRE-MED — Your Premium Medical Solution | Orthopedic Implants Saudi Arabia',
      metaDescription: "Saudi Arabia's trusted partner for premium orthopedic implants, surgical systems, and clinical excellence – powering better patient outcomes across the Kingdom and beyond.",
      metaKeywords: ['PRE-MED', 'orthopedic implants', 'Saudi Arabia', 'medical devices', 'SFDA'],
    },
  });
  console.log('Home page seeded');

  // ──────────────────────────────────────────────
  // 4. ABOUT PAGE — Every word from the PDF
  // ──────────────────────────────────────────────
  await About.create({
    title: 'About Premium Medical Solutions Company',
    language: 'en',
    isActive: true,
    image: {
      url: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=1200&q=80',
      alt: 'PRE-MED Premium Medical Solutions office and team',
    },
    content: JSON.stringify({
      companyProfile: {
        badge: 'COMPANY PROFILE',
        title: 'About Premium Medical Solutions Company',
        paragraph1: 'Premium Medical Solutions Company (PRE-MED) is a Saudi-based healthcare distributor dedicated to advancing medical care across the Kingdom and the Middle East. Since our founding in 2020, we have built a strong reputation for delivering high-quality medical solutions, technical expertise, and reliable service to healthcare providers throughout the region.',
        paragraph2: 'Initially established to serve the orthopedic sector, PRE-MED has grown into a trusted partner for hospitals and surgeons – offering a comprehensive range of implants, instruments, and surgical accessories. Building on this foundation, we are strategically expanding our portfolio to include additional medical specialties, broadening our ability to meet the evolving needs of the healthcare industry.',
        whyPreMed: [
          'Headquartered in Riyadh, operating nationwide',
          'Regulatory excellence with SFDA-compliant processes',
          'Responsive logistics with a robust inventory buffer',
          'Strong global manufacturing partnerships',
          'Focused on optimal patient outcomes',
        ],
      },
      ceoMessage: {
        badge: 'LEADERSHIP',
        title: 'Message from the President & Chief Executive Officer',
        name: 'Islam Ali',
        role: 'President and Chief Executive Officer',
        quote: 'At PRE-MED, we exist to elevate surgical care in Saudi Arabia through trust, expertise, and meaningful partnerships.',
        paragraphs: [
          'From day one, we set out to build more than a distribution business – we built an organization centered on patient outcomes, surgeon success, and long-term value for the healthcare system. Every decision we make – from product selection to clinical support and operational execution – is guided by one principle: doing what is right for the patient.',
          'As the Kingdom advances its healthcare transformation under Vision 2030, PRE-MED is proud to play an active role. We invest continuously in people, technology, education, and partnerships that raise the standard of care. Looking ahead, we are strategically expanding into Ophthalmology, Dental, and Craniomaxillofacial (CMF) – while orthopedics remains our core strength.',
          'Thank you to our surgeon partners, hospital customers, global manufacturing partners, and our exceptional team. Together, we are building a future defined by clinical excellence, integrity, and sustainable growth.',
        ],
      },
      atAGlance: {
        badge: 'AT A GLANCE',
        title: 'PRE-MED at a Glance',
        subtitle: "Leading Saudi distributor of premium orthopedic implants and medical devices – serving the Kingdom's top hospitals since 2020.",
        stats: [
          { value: '2020', label: 'Year Founded', description: 'Building trust from day one' },
          { value: '8+', label: 'Exclusive Global Partners', description: 'World-class manufacturers' },
          { value: '3', label: 'Key Cities', description: 'Riyadh · Dammam · Jeddah' },
          { value: '100%', label: 'SFDA Compliant', description: 'Regulatory excellence guaranteed' },
        ],
        headquarters: {
          address: '3813 King Abdulaziz Rd, Al Wizarat, Riyadh 12622',
          coverage: 'Nationwide across Saudi Arabia + GCC expansion',
        },
      },
      purposeVisionMission: {
        badge: 'OUR FOUNDATION',
        title: 'Purpose, Vision & Mission',
        intro: "Three pillars define who we are, what we aspire to achieve, and how we operate every day – aligned with Saudi Arabia's Vision 2030 healthcare transformation agenda.",
        purpose: "Advance orthopedic healthcare in Saudi Arabia by connecting providers with the world's best medical technologies and service excellence – for better patient outcomes at every level of care.",
        vision: 'Be the leading orthopedic solutions provider in the GCC – recognized for innovation, quality, reliability, and patient-focused partnerships that set a new regional standard.',
        mission: 'Provide premium, clinically proven products with exceptional service, reliable regulatory support, and responsive logistics – creating sustainable value for partners, employees, and the healthcare system.',
      },
      coreValues: {
        title: 'Core Values',
        values: [
          { title: 'Patient-Centered', description: 'Every product decision and clinical action starts with patient safety and outcomes.' },
          { title: 'Uncompromising Quality', description: 'We partner only with world-class manufacturers and maintain rigorous standards.' },
          { title: 'Integrity', description: 'Transparent, ethical conduct in every business and clinical interaction.' },
          { title: 'Innovation', description: 'Continuously seeking better technologies and smarter solutions for the healthcare system.' },
          { title: 'Teamwork & Respect', description: 'A culture of shared purpose, mutual respect, and collective accountability.' },
          { title: 'Continuous Improvement', description: 'We invest in training, processes, and performance to raise the standard every day.' },
        ],
      },
      ourCause: {
        badge: 'WHY WE EXIST',
        title: 'Our Cause — Why We Are Here',
        intro: 'To contribute to global health by providing our customers with high-quality products and services, whilst creating meaningful opportunities for our employees and generating sustainable shareholder value. This is not just a mission statement – it is the lens through which every business decision is made.',
        pillars: [
          { title: 'Customer Focus', description: 'We deliver customer satisfaction by listening to and exceeding expectations. We add measurable value through our services and seek innovative solutions to help our customers achieve their clinical and operational goals.' },
          { title: 'Quality in Everything', description: 'We deliver quality in all our work – providing accurate results on time, using the best appropriate technology and methods. We continuously seek to improve or refine our processes, holding ourselves to the highest standards in the industry.' },
          { title: 'Competence & Team Spirit', description: 'We employ a team of talented and competent professionals, investing in training and creating strong career pathways. We recognize and encourage outstanding performance, because our people are the engine behind every client success.' },
          { title: 'Integrity', description: 'We behave ethically in all business and financial activities – demonstrating respect towards our customers, our staff, and the broader healthcare community. Integrity is not a value we aspire to; it is a standard we hold ourselves to daily.' },
        ],
      },
      whatSetsApart: {
        badge: 'OUR ADVANTAGE',
        title: 'What Sets PRE-MED Apart',
        intro: 'In a market crowded with generalist distributors, PRE-MED delivers a differentiated model – combining exclusive product access, deep clinical expertise, and operational reliability that hospitals and surgeons can depend on.',
        advantages: [
          { title: 'Premium Products Only', description: 'Exclusive partnerships with world-class manufacturers; every system is clinically proven and rigorously vetted before market entry.' },
          { title: 'One-Stop Orthopedic Partner', description: 'Arthroplasty · Trauma · Spine · Sports Medicine · Surgical Accessories – comprehensive coverage under one trusted relationship.' },
          { title: 'Regulatory Excellence (SFDA)', description: 'Dedicated team managing registrations, renewals, Arabic labeling, and post-market compliance – so your procurement is always covered.' },
          { title: 'Reliable Logistics & Buffer', description: 'Riyadh hub + regional coverage; a 3-4 month inventory buffer engineered to eliminate stockouts on critical surgical products.' },
          { title: '24/7 Emergency Response', description: 'Always-on readiness for trauma and critical surgical cases – because patient care never sleeps, and neither do we.' },
          { title: 'Clinical Support & Training', description: 'On-site surgical support, structured education programs, and dedicated OR team training to maximize procedural outcomes.' },
        ],
      },
      whoWeServe: {
        badge: 'OUR CLIENTS',
        title: 'Who We Serve',
        intro: "PRE-MED is a trusted partner to Saudi Arabia's top healthcare institutions – spanning government, military, tertiary, and private sectors. Our relationships are built on clinical credibility, responsive service, and a shared commitment to patient excellence.",
        sectors: [
          { title: 'Government Sector', items: ['Ministry of Health hospitals', 'King Fahd Medical City', 'Regional referral centers across the Kingdom'] },
          { title: 'Military & Security', items: ['Military & Security Forces hospitals', 'National Guard Health Affairs', 'High-readiness trauma networks'] },
          { title: 'Tertiary / Quaternary', items: ['King Faisal Specialist Hospital & Research Centre', 'University hospitals', 'Centers of clinical excellence'] },
          { title: 'Private Sector', items: ['Leading private hospital groups', 'Specialty orthopedic & sports clinics', 'Ambulatory surgery centers (ASCs)'] },
        ],
      },
      operatingModel: {
        badge: 'OPERATING MODEL',
        title: 'How PRE-MED Delivers',
        intro: 'A full-service distribution model integrating regulatory expertise, advanced supply chain management, and hands-on clinical support – designed to deliver seamless value from global manufacturer to patient outcome.',
        pipeline: ['Global Partners', 'Regulatory', 'Supply Chain', 'Clinical Support', 'Customer Success'],
        footer: 'This end-to-end model ensures that every product PRE-MED delivers is regulatory-compliant, clinically supported, and operationally reliable – from initial contract through post-market vigilance.',
        organization: {
          title: 'Scalable, Customer-Centric Organization',
          departments: ['Sales & Business Development', 'Supply Chain & Logistics', 'Regulatory & Compliance', 'Technical & Clinical Support', 'Finance & Administration', 'Human Resources'],
        },
      },
      qualityCompliance: {
        badge: 'QUALITY & COMPLIANCE',
        title: 'Quality & SFDA Regulatory Excellence',
        intro: 'Regulatory excellence is a foundational pillar of our operating model, ensuring every product meets the highest standards of safety and traceability.',
        items: [
          { title: 'Quality System', description: 'We maintain ISO-aligned processes for document control, training, audits, and CAPA management.' },
          { title: 'SFDA Registrations', description: 'Our team ensures proactive registrations and Arabic labeling compliance for uninterrupted product availability.' },
          { title: 'Traceability & UDI', description: 'We guarantee full lot-level tracking, barcode management, and recall readiness protocols.' },
          { title: 'Vigilance', description: 'Rigorous complaint handling and adverse event reporting protect patients while maintaining regulatory trust.' },
        ],
        complianceLifecycle: {
          title: 'Compliance life cycle',
          description: 'Our Compliance Lifecycle prioritizes patient safety across five interconnected stages: Import, Store, Distribute, Monitor, and Register.',
          stages: ['Import', 'Store', 'Distribute', 'Monitor', 'Register'],
        },
      },
      strategy: {
        badge: 'STRATEGY',
        title: 'Business & Operational Strategy',
        intro: 'PRE-MED is a specialized healthcare distribution company with a focused, high-expertise commercial approach – covering the entire Kingdom of Saudi Arabia. Since 2020, we have deliberately chosen depth over breadth, building dominant brand positioning in our target therapeutic areas rather than competing as a generalist distributor.',
        pillars: [
          { title: 'Focused Therapeutic Areas', description: 'We concentrate on select high-value specialties – Orthopedics, General Surgery, Surgical Instruments & Systems – enabling higher margins, promotional synergies, and manageable competitive dynamics.' },
          { title: 'Niche Market Positioning', description: 'We carve a differentiated niche among large-volume generalist distributors through absolute clinical focus, deep product expertise, and a surgeon-first service culture that builds long-term loyalty.' },
          { title: 'Business Unit Model', description: 'Dedicated business unit leaders carry holistic commercial responsibility – supported by focused sales teams, a high-performance incentive structure, and direct accountability for clinical and financial outcomes.' },
          { title: 'Incorporate Strategy', description: 'Expanding beyond orthopedics into Ophthalmology, Dental, and CMF – building new franchises with the same disciplined, exclusive-partnership model that has driven our orthopedic success.' },
        ],
        footer: "PRE-MED's strategy is built on exclusive partnerships, clinical depth, and a relentless focus on the Saudi healthcare market – aligning directly with Vision 2030 objectives to localize and elevate the standard of medical supply.",
      },
      logistics: {
        badge: 'LOGISTICS',
        title: 'Logistics & Service Excellence',
        intro: "Designed for critical surgical schedules, PRE-MED's logistics infrastructure is engineered to ensure the right product is available at the right time – every time. Our Riyadh-based central hub, supported by regional distribution nodes in the West and East, provides nationwide coverage with the redundancy and buffer depth that surgical teams demand.",
        metrics: [
          { value: '99.8%', label: 'On-Time Delivery', description: 'Consistently meeting surgical schedules across all regions' },
          { value: '99.5%', label: 'Order Accuracy', description: 'Precision picking and verification protocols' },
          { value: '100%', label: 'SFDA Compliance', description: 'Every shipment fully regulatory compliant' },
        ],
        highlights: [
          { value: '24/7', description: 'Emergency Readiness – always-on dispatch for trauma and urgent surgical cases' },
          { value: '3-4 Months', description: 'Inventory Buffer – protecting hospitals from supply disruptions and stockouts' },
          { value: '3 Hubs', description: 'Riyadh (Central) · Jeddah (West) · Dammam (East) – nationwide coverage' },
        ],
      },
      organizationStructure: {
        badge: 'ORGANIZATION',
        title: 'PRE-MED Organizational Structure 2026',
        intro: "PRE-MED's organizational design is built for accountability and customer-centricity. Led by President & CEO Islam Ali, our structure empowers dedicated business unit leaders and functional specialists to deliver excellence across sales, supply chain, regulatory affairs, clinical support, and administration – ensuring every hospital partner receives focused, expert attention.",
        departments: [
          { title: 'Commercial Leadership', description: 'Regional Sales Managers and Senior Product Specialists covering Eastern, Western, and Central regions.' },
          { title: 'Supply Chain & Regulatory', description: 'Dedicated Procurement Officers, Supply Chain Manager, and Regulatory Officers ensuring product availability and compliance.' },
          { title: 'Clinical & Technical', description: 'Technical Support and Product Specialists embedded with surgical teams for hands-on OR support and training delivery.' },
          { title: 'Finance & Administration', description: 'Finance Manager, General Accountant, HR, and CEO Secretary providing robust operational infrastructure.' },
        ],
      },
      contact: {
        badge: 'GET IN TOUCH',
        title: 'Partner With PRE-MED',
        intro: "Ready to elevate your hospital's orthopedic capabilities? We'd love to connect and explore how PRE-MED can support your clinical and procurement needs.",
        website: 'www.premedsolution.com',
        headquarters: 'Riyadh, Kingdom of Saudi Arabia',
        partnerships: 'Exclusive distributor partnerships across KSA',
        tagline: "PRE-MED – Your Premium Medical Solution | Saudi Arabia's trusted orthopedic partner since 2020",
      },
    }),
    features: [
      { title: 'Patient-Centered', content: 'Every product decision and clinical action starts with patient safety and outcomes.', order: 0 },
      { title: 'Uncompromising Quality', content: 'We partner only with world-class manufacturers and maintain rigorous standards.', order: 1 },
      { title: 'Integrity', content: 'Transparent, ethical conduct in every business and clinical interaction.', order: 2 },
      { title: 'Innovation', content: 'Continuously seeking better technologies and smarter solutions for the healthcare system.', order: 3 },
      { title: 'Teamwork & Respect', content: 'A culture of shared purpose, mutual respect, and collective accountability.', order: 4 },
      { title: 'Continuous Improvement', content: 'We invest in training, processes, and performance to raise the standard every day.', order: 5 },
    ],
    seo: {
      metaTitle: 'About PRE-MED — Premium Medical Solutions Company',
      metaDescription: 'Premium Medical Solutions Company (PRE-MED) is a Saudi-based healthcare distributor dedicated to advancing medical care across the Kingdom and the Middle East since 2020.',
      metaKeywords: ['PRE-MED', 'about', 'medical solutions', 'Saudi Arabia', 'orthopedic', 'healthcare distributor'],
    },
  });
  console.log('About page seeded');

  // ──────────────────────────────────────────────
  // 5. PARTNERS (Innovative Product Partnerships)
  // ──────────────────────────────────────────────
  const partners = await Partner.insertMany([
    { name: 'Acumed', slug: 'acumed', url: 'https://www.acumed.net', logo: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80', brief: 'Innovative solutions for orthopedic trauma and upper extremity surgery, trusted by surgeons worldwide.' },
    { name: 'Movmedix', slug: 'movmedix', url: 'https://www.movmedix.com', logo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80', brief: 'Advanced motion and sports medicine technologies for soft tissue repair and ligament reconstruction.' },
    { name: 'GetSet Surgical', slug: 'getset-surgical', url: 'https://www.getsetsurgical.com', logo: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&q=80', brief: 'Precision surgical instruments and systems engineered for the demands of modern orthopedic procedures.' },
    { name: 'OTOM', slug: 'otom', url: 'https://www.theotom.com', logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80', brief: 'Specialized orthopedic and trauma solutions designed to address complex clinical challenges with precision.' },
    { name: 'Paradigm BioDevices', slug: 'paradigm-biodevices', url: 'https://www.paradigmbiodevices.com', logo: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80', brief: 'Biodevice innovations focused on advancing fixation and healing outcomes in orthopedic surgery.' },
    { name: 'Hyprevention', slug: 'hyprevention', url: 'https://www.hyprevention.com', logo: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80', brief: 'Cutting-edge solutions for fracture prevention and bone health management in aging patient populations.' },
  ]);
  console.log('Partners seeded:', partners.length);

  // ──────────────────────────────────────────────
  // 6. SERVICES (Product Portfolio Overview)
  // ──────────────────────────────────────────────
  const services = await Service.insertMany([
    {
      title: 'Arthroplasty', slug: 'arthroplasty', language: 'en', isActive: true,
      subtitle: 'Joint Replacement Systems', featured: true, order: 0,
      featuredImage: 'https://images.unsplash.com/photo-1530497610245-b489b3feec8a?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1530497610245-b489b3feec8a?w=400&q=80',
      excerpt: 'Knee, hip, shoulder, ankle, and small joint replacement systems – premium implants for primary and revision procedures.',
      content: '<h2>Arthroplasty</h2><p>Knee, hip, shoulder, ankle, and small joint replacement systems – premium implants for primary and revision procedures.</p><p>PRE-MED provides a complete range of arthroplasty solutions from world-class manufacturers, covering primary and complex revision surgeries. Our systems are backed by clinical evidence and supported by dedicated surgical training programs.</p>',
      tags: ['arthroplasty', 'joint replacement', 'knee', 'hip', 'shoulder', 'ankle'],
      seo: { metaTitle: 'Arthroplasty — Joint Replacement Systems | PRE-MED', metaDescription: 'Knee, hip, shoulder, ankle, and small joint replacement systems – premium implants for primary and revision procedures.', metaKeywords: ['arthroplasty', 'joint replacement', 'knee replacement', 'hip replacement'] },
    },
    {
      title: 'Trauma & Extremities', slug: 'trauma-and-extremities', language: 'en', isActive: true,
      subtitle: 'Fracture Fixation Systems', featured: true, order: 1,
      featuredImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80',
      excerpt: 'Plates, intramedullary nails, and advanced fixation systems designed for reliability in high-acuity trauma settings.',
      content: '<h2>Trauma & Extremities</h2><p>Plates, intramedullary nails, and advanced fixation systems designed for reliability in high-acuity trauma settings.</p><p>Our trauma portfolio covers the full spectrum of fracture management – from simple fractures to complex polytrauma cases. Each system is selected for its clinical reliability, ease of use, and proven surgical outcomes.</p>',
      tags: ['trauma', 'extremities', 'fracture fixation', 'plates', 'nails'],
      seo: { metaTitle: 'Trauma & Extremities — Fracture Fixation | PRE-MED', metaDescription: 'Plates, intramedullary nails, and advanced fixation systems designed for reliability in high-acuity trauma settings.', metaKeywords: ['trauma', 'fracture fixation', 'orthopedic trauma'] },
    },
    {
      title: 'Spine', slug: 'spine', language: 'en', isActive: true,
      subtitle: 'Spinal Surgery Solutions', featured: true, order: 2,
      featuredImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80',
      excerpt: 'Pre-sterile, single-use spinal systems; minimally invasive surgery (MIS) solutions for safer, faster recoveries.',
      content: '<h2>Spine</h2><p>Pre-sterile, single-use spinal systems; minimally invasive surgery (MIS) solutions for safer, faster recoveries.</p><p>PRE-MED delivers advanced spinal solutions designed for both open and minimally invasive procedures. Our systems prioritize patient safety, procedural efficiency, and reproducible clinical outcomes.</p>',
      tags: ['spine', 'spinal surgery', 'MIS', 'minimally invasive'],
      seo: { metaTitle: 'Spine — Spinal Surgery Solutions | PRE-MED', metaDescription: 'Pre-sterile, single-use spinal systems; minimally invasive surgery (MIS) solutions for safer, faster recoveries.', metaKeywords: ['spine surgery', 'spinal implants', 'MIS'] },
    },
    {
      title: 'Sports Medicine', slug: 'sports-medicine', language: 'en', isActive: true,
      subtitle: 'Arthroscopic & Soft Tissue Solutions', featured: true, order: 3,
      featuredImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
      excerpt: 'Ligament reconstruction, soft tissue repair, and arthroscopic systems – trusted by sports surgeons across the Kingdom.',
      content: '<h2>Sports Medicine</h2><p>Ligament reconstruction, soft tissue repair, and arthroscopic systems – trusted by sports surgeons across the Kingdom.</p><p>Our sports medicine portfolio equips surgeons with the latest technologies for ACL/PCL reconstruction, rotator cuff repair, meniscus treatment, and advanced arthroscopic procedures.</p>',
      tags: ['sports medicine', 'arthroscopy', 'ligament reconstruction', 'soft tissue repair'],
      seo: { metaTitle: 'Sports Medicine — Arthroscopic Systems | PRE-MED', metaDescription: 'Ligament reconstruction, soft tissue repair, and arthroscopic systems – trusted by sports surgeons across the Kingdom.', metaKeywords: ['sports medicine', 'arthroscopy', 'ligament reconstruction'] },
    },
    {
      title: 'Surgical Accessories', slug: 'surgical-accessories', language: 'en', isActive: true,
      subtitle: 'Instruments & Consumables', featured: true, order: 4,
      featuredImage: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=400&q=80',
      excerpt: 'Instruments, wound closure, bone cement, and complementary consumables to support every stage of the surgical episode.',
      content: '<h2>Surgical Accessories</h2><p>Instruments, wound closure, bone cement, and complementary consumables to support every stage of the surgical episode.</p><p>PRE-MED provides a comprehensive catalog of surgical accessories that complement our implant systems – ensuring surgical teams have everything needed for optimal procedural outcomes.</p>',
      tags: ['surgical accessories', 'instruments', 'bone cement', 'wound closure', 'consumables'],
      seo: { metaTitle: 'Surgical Accessories — Instruments & Consumables | PRE-MED', metaDescription: 'Instruments, wound closure, bone cement, and complementary consumables to support every stage of the surgical episode.', metaKeywords: ['surgical accessories', 'instruments', 'bone cement'] },
    },
  ]);
  console.log('Services seeded:', services.length);

  // ──────────────────────────────────────────────
  // 7. CLIENTS (Who We Serve)
  // ──────────────────────────────────────────────
  await Client.insertMany([
    { name: 'Ministry of Health', logo: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=80', brief: 'Ministry of Health hospitals across the Kingdom of Saudi Arabia.' },
    { name: 'King Fahd Medical City', logo: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80', brief: 'One of the largest and most advanced medical complexes in the Kingdom.' },
    { name: 'King Faisal Specialist Hospital & Research Centre', logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80', brief: 'Premier quaternary care and research institution in Saudi Arabia.' },
    { name: 'National Guard Health Affairs', logo: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&q=80', brief: 'Comprehensive military healthcare system serving National Guard personnel and families.' },
    { name: 'Military & Security Forces Hospitals', logo: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&q=80', brief: 'Military & Security Forces hospitals and high-readiness trauma networks.' },
  ]);
  console.log('Clients seeded');

  // ──────────────────────────────────────────────
  // 8. BLOG POSTS
  // ──────────────────────────────────────────────
  await Blog.insertMany([
    {
      title: 'How PRE-MED Delivers: Our Full-Service Distribution Model', slug: 'how-premed-delivers', language: 'en', isActive: true,
      subtitle: 'From global manufacturer to patient outcome',
      excerpt: 'A full-service distribution model integrating regulatory expertise, advanced supply chain management, and hands-on clinical support – designed to deliver seamless value from global manufacturer to patient outcome.',
      content: '<h2>How PRE-MED Delivers</h2><p>A full-service distribution model integrating regulatory expertise, advanced supply chain management, and hands-on clinical support – designed to deliver seamless value from global manufacturer to patient outcome.</p><h3>Our End-to-End Pipeline</h3><ol><li><strong>Global Partners</strong> – Sourcing from world-class manufacturers</li><li><strong>Regulatory</strong> – SFDA registration and compliance</li><li><strong>Supply Chain</strong> – Advanced logistics and inventory management</li><li><strong>Clinical Support</strong> – On-site surgical support and training</li><li><strong>Customer Success</strong> – Ongoing partnership and service excellence</li></ol><p>This end-to-end model ensures that every product PRE-MED delivers is regulatory-compliant, clinically supported, and operationally reliable – from initial contract through post-market vigilance.</p>',
      status: 'published', publishedAt: new Date(), readingTime: 5,
      tags: ['operating model', 'distribution', 'supply chain', 'clinical support'],
      seo: { metaTitle: 'How PRE-MED Delivers — Full-Service Distribution Model', metaDescription: 'A full-service distribution model integrating regulatory expertise, advanced supply chain management, and hands-on clinical support.' },
    },
    {
      title: 'Quality & SFDA Regulatory Excellence at PRE-MED', slug: 'quality-sfda-regulatory-excellence', language: 'en', isActive: true,
      subtitle: 'Ensuring every product meets the highest standards',
      excerpt: 'Regulatory excellence is a foundational pillar of our operating model, ensuring every product meets the highest standards of safety and traceability.',
      content: '<h2>Quality & SFDA Regulatory Excellence</h2><p>Regulatory excellence is a foundational pillar of our operating model, ensuring every product meets the highest standards of safety and traceability.</p><h3>Quality System</h3><p>We maintain ISO-aligned processes for document control, training, audits, and CAPA management.</p><h3>SFDA Registrations</h3><p>Our team ensures proactive registrations and Arabic labeling compliance for uninterrupted product availability.</p><h3>Traceability & UDI</h3><p>We guarantee full lot-level tracking, barcode management, and recall readiness protocols.</p><h3>Vigilance</h3><p>Rigorous complaint handling and adverse event reporting protect patients while maintaining regulatory trust.</p><h3>Compliance Lifecycle</h3><p>Our Compliance Lifecycle prioritizes patient safety across five interconnected stages: Import, Store, Distribute, Monitor, and Register.</p>',
      status: 'published', publishedAt: new Date(), readingTime: 4,
      tags: ['quality', 'SFDA', 'regulatory', 'compliance', 'traceability'],
      seo: { metaTitle: 'Quality & SFDA Regulatory Excellence — PRE-MED', metaDescription: 'Regulatory excellence is a foundational pillar of our operating model, ensuring every product meets the highest standards of safety and traceability.' },
    },
    {
      title: 'PRE-MED Business & Operational Strategy', slug: 'business-operational-strategy', language: 'en', isActive: true,
      subtitle: 'Depth over breadth since 2020',
      excerpt: 'PRE-MED is a specialized healthcare distribution company with a focused, high-expertise commercial approach – covering the entire Kingdom of Saudi Arabia.',
      content: '<h2>Business & Operational Strategy</h2><p>PRE-MED is a specialized healthcare distribution company with a focused, high-expertise commercial approach – covering the entire Kingdom of Saudi Arabia. Since 2020, we have deliberately chosen depth over breadth, building dominant brand positioning in our target therapeutic areas rather than competing as a generalist distributor.</p><h3>Focused Therapeutic Areas</h3><p>We concentrate on select high-value specialties – Orthopedics, General Surgery, Surgical Instruments & Systems – enabling higher margins, promotional synergies, and manageable competitive dynamics.</p><h3>Niche Market Positioning</h3><p>We carve a differentiated niche among large-volume generalist distributors through absolute clinical focus, deep product expertise, and a surgeon-first service culture that builds long-term loyalty.</p><h3>Business Unit Model</h3><p>Dedicated business unit leaders carry holistic commercial responsibility – supported by focused sales teams, a high-performance incentive structure, and direct accountability for clinical and financial outcomes.</p><h3>Incorporate Strategy</h3><p>Expanding beyond orthopedics into Ophthalmology, Dental, and CMF – building new franchises with the same disciplined, exclusive-partnership model that has driven our orthopedic success.</p><p><em>PRE-MED\'s strategy is built on exclusive partnerships, clinical depth, and a relentless focus on the Saudi healthcare market – aligning directly with Vision 2030 objectives to localize and elevate the standard of medical supply.</em></p>',
      status: 'published', publishedAt: new Date(), readingTime: 5,
      tags: ['strategy', 'business', 'Vision 2030', 'growth'],
      seo: { metaTitle: 'Business & Operational Strategy — PRE-MED', metaDescription: 'PRE-MED is a specialized healthcare distribution company with a focused, high-expertise commercial approach.' },
    },
    {
      title: 'Logistics & Service Excellence', slug: 'logistics-service-excellence', language: 'en', isActive: true,
      subtitle: 'The right product, at the right time – every time',
      excerpt: "Designed for critical surgical schedules, PRE-MED's logistics infrastructure is engineered to ensure the right product is available at the right time – every time.",
      content: '<h2>Logistics & Service Excellence</h2><p>Designed for critical surgical schedules, PRE-MED\'s logistics infrastructure is engineered to ensure the right product is available at the right time – every time. Our Riyadh-based central hub, supported by regional distribution nodes in the West and East, provides nationwide coverage with the redundancy and buffer depth that surgical teams demand.</p><h3>Performance Metrics</h3><ul><li><strong>99.8% On-Time Delivery</strong> – Consistently meeting surgical schedules across all regions</li><li><strong>99.5% Order Accuracy</strong> – Precision picking and verification protocols</li><li><strong>100% SFDA Compliance</strong> – Every shipment fully regulatory compliant</li></ul><h3>Operational Highlights</h3><ul><li><strong>24/7 Emergency Readiness</strong> – Always-on dispatch for trauma and urgent surgical cases</li><li><strong>3-4 Month Inventory Buffer</strong> – Protecting hospitals from supply disruptions and stockouts</li><li><strong>3 Regional Hubs</strong> – Riyadh (Central) · Jeddah (West) · Dammam (East) – nationwide coverage</li></ul>',
      status: 'published', publishedAt: new Date(), readingTime: 3,
      tags: ['logistics', 'supply chain', 'delivery', 'service excellence'],
      seo: { metaTitle: 'Logistics & Service Excellence — PRE-MED', metaDescription: "Designed for critical surgical schedules, PRE-MED's logistics infrastructure is engineered to ensure the right product is available at the right time." },
    },
  ]);
  console.log('Blog posts seeded');

  // ──────────────────────────────────────────────
  // 9. ENSURE ADMIN USER EXISTS
  // ──────────────────────────────────────────────
  const existingAdmin = await User.findOne({ email: 'admin@premedsolution.com' });
  if (!existingAdmin) {
    await User.create({ name: 'Admin', email: 'admin@premedsolution.com', password: 'Admin@123', role: 'admin' });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  // ──────────────────────────────────────────────
  console.log('\n========================================');
  console.log('Database seeded successfully!');
  console.log('========================================');
  console.log('Admin login: admin@premedsolution.com / Admin@123');
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
