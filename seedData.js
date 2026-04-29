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
    // ── 1. Trauma Solution ──
    {
      title: 'Trauma Solution', slug: 'trauma-solution', language: 'en', isActive: true,
      subtitle: 'Advanced Fracture Fixation Systems', featured: true, order: 0,
      featuredImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80',
      excerpt: 'Comprehensive trauma fixation systems – plates, intramedullary nails, and external fixation devices for high-acuity emergency and elective fracture management.',
      content: '<h2>Trauma Solution</h2><p>PRE-MED delivers a comprehensive portfolio of trauma fixation systems designed for reliability in the most demanding clinical settings. From simple fractures to complex polytrauma cases, our systems cover the full spectrum of fracture management.</p><h3>Product Range</h3><ul><li>Locking and non-locking plate systems for upper and lower extremities</li><li>Intramedullary nailing systems for femoral, tibial, and humeral fractures</li><li>External fixation devices for damage control orthopedics</li><li>Fragment-specific fixation for periarticular fractures</li><li>Cannulated screw systems for minimally invasive fixation</li></ul><h3>Clinical Support</h3><p>Our trauma team provides 24/7 emergency response, ensuring implants and instruments are available for urgent surgical cases across all three regional hubs – Riyadh, Jeddah, and Dammam.</p>',
      tags: ['trauma', 'fracture fixation', 'plates', 'nails', 'emergency orthopedics'],
      seo: { metaTitle: 'Trauma Solution — Fracture Fixation Systems | PRE-MED', metaDescription: 'Advanced trauma fixation systems – plates, intramedullary nails, and external fixation for emergency and elective fracture management in Saudi Arabia.', metaKeywords: ['trauma solution', 'fracture fixation', 'orthopedic trauma', 'plates', 'nails'] },
    },
    // ── 2. Sports Medicine Solution ──
    {
      title: 'Sports Medicine Solution', slug: 'sports-medicine-solution', language: 'en', isActive: true,
      subtitle: 'Arthroscopic & Soft Tissue Repair Systems', featured: true, order: 1,
      featuredImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
      excerpt: 'Ligament reconstruction, soft tissue repair, and arthroscopic systems – trusted by sports surgeons across the Kingdom for ACL/PCL reconstruction, rotator cuff repair, and meniscus treatment.',
      content: '<h2>Sports Medicine Solution</h2><p>PRE-MED\'s sports medicine portfolio equips surgeons with the latest technologies for treating athletic injuries – from weekend warriors to elite professional athletes.</p><h3>Product Range</h3><ul><li>ACL and PCL reconstruction systems with advanced graft fixation</li><li>Rotator cuff repair anchors and suture systems</li><li>Meniscus repair devices and all-inside techniques</li><li>Shoulder instability solutions (Bankart, SLAP, Latarjet)</li><li>Arthroscopic instrumentation and visualization systems</li></ul><h3>Why PRE-MED</h3><p>Our partnership with Movmedix brings cutting-edge motion and sports medicine technologies to the Saudi market – supporting the Kingdom\'s growing athletic community and Vision 2030 sports development goals.</p>',
      tags: ['sports medicine', 'arthroscopy', 'ACL reconstruction', 'ligament repair', 'rotator cuff'],
      seo: { metaTitle: 'Sports Medicine Solution — Arthroscopic Systems | PRE-MED', metaDescription: 'Ligament reconstruction, soft tissue repair, and arthroscopic systems trusted by sports surgeons across Saudi Arabia.', metaKeywords: ['sports medicine', 'arthroscopy', 'ACL reconstruction', 'ligament repair'] },
    },
    // ── 3. Orthopedic Solution ──
    {
      title: 'Orthopedic Solution', slug: 'orthopedic-solution', language: 'en', isActive: true,
      subtitle: 'Joint Replacement & Reconstruction Systems', featured: true, order: 2,
      featuredImage: 'https://images.unsplash.com/photo-1530497610245-b489b3feec8a?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1530497610245-b489b3feec8a?w=400&q=80',
      excerpt: 'Premium arthroplasty systems for knee, hip, shoulder, ankle, and small joint replacement – covering primary procedures through complex revisions.',
      content: '<h2>Orthopedic Solution</h2><p>PRE-MED provides a complete range of arthroplasty and reconstruction solutions from world-class manufacturers, covering primary and complex revision surgeries for all major joints.</p><h3>Product Range</h3><ul><li>Total knee replacement systems with anatomic femoral designs</li><li>Total hip arthroplasty with advanced bearing surfaces (ceramic, HXLPE)</li><li>Shoulder replacement – anatomic and reverse systems</li><li>Ankle and small joint replacement</li><li>Revision arthroplasty systems with modular augments and stems</li></ul><h3>Clinical Excellence</h3><p>Every arthroplasty system is backed by clinical evidence and supported by dedicated surgical training programs, cadaveric workshops, and in-theater product specialist support.</p>',
      tags: ['orthopedic', 'arthroplasty', 'joint replacement', 'knee', 'hip', 'shoulder'],
      seo: { metaTitle: 'Orthopedic Solution — Joint Replacement Systems | PRE-MED', metaDescription: 'Premium arthroplasty systems for knee, hip, shoulder, and ankle replacement – primary and revision procedures in Saudi Arabia.', metaKeywords: ['orthopedic solution', 'arthroplasty', 'joint replacement', 'knee replacement', 'hip replacement'] },
    },
    // ── 4. Wound Management Solution ──
    {
      title: 'Wound Management Solution', slug: 'wound-management-solution', language: 'en', isActive: true,
      subtitle: 'Advanced Wound Care & Closure Systems', featured: true, order: 3,
      featuredImage: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=400&q=80',
      excerpt: 'Comprehensive wound management solutions – from advanced wound closure systems and negative pressure therapy to specialized dressings for surgical and chronic wound care.',
      content: '<h2>Wound Management Solution</h2><p>PRE-MED offers a comprehensive range of wound management products designed to optimize healing outcomes across surgical, traumatic, and chronic wound care settings.</p><h3>Product Range</h3><ul><li>Surgical wound closure systems – sutures, staples, and skin adhesives</li><li>Negative pressure wound therapy (NPWT) devices</li><li>Advanced wound dressings – antimicrobial, foam, alginate, and hydrocolloid</li><li>Wound debridement and irrigation systems</li><li>Skin substitutes and biological wound matrices</li></ul><h3>Clinical Impact</h3><p>Effective wound management is critical across all surgical specialties. Our solutions support faster healing, reduced infection rates, and better patient outcomes – from the operating room through rehabilitation.</p>',
      tags: ['wound management', 'wound closure', 'NPWT', 'surgical dressings', 'wound care'],
      seo: { metaTitle: 'Wound Management Solution — Advanced Wound Care | PRE-MED', metaDescription: 'Advanced wound management solutions – closure systems, negative pressure therapy, and specialized dressings for surgical and chronic wound care.', metaKeywords: ['wound management', 'wound closure', 'wound care', 'NPWT', 'surgical dressings'] },
    },
    // ── 5. Spine Solution ──
    {
      title: 'Spine Solution', slug: 'spine-solution', language: 'en', isActive: true,
      subtitle: 'Spinal Surgery & MIS Systems', featured: true, order: 4,
      featuredImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80',
      excerpt: 'Pre-sterile, single-use spinal systems and minimally invasive surgery (MIS) solutions for safer, faster recoveries – from cervical to lumbar procedures.',
      content: '<h2>Spine Solution</h2><p>PRE-MED delivers advanced spinal solutions designed for both open and minimally invasive procedures. Our portfolio prioritizes patient safety, procedural efficiency, and reproducible clinical outcomes.</p><h3>Product Range</h3><ul><li>Pedicle screw and rod systems for posterior spinal fixation</li><li>Pre-sterile, single-use spinal instrument sets</li><li>Minimally invasive surgery (MIS) retractor and access systems</li><li>Interbody fusion cages – TLIF, PLIF, ALIF, and lateral</li><li>Cervical plate and screw systems</li><li>Vertebral augmentation (kyphoplasty/vertebroplasty)</li></ul><h3>MIS Advantage</h3><p>Our MIS spine systems enable smaller incisions, less tissue damage, reduced blood loss, shorter hospital stays, and faster return to daily activities – the future of spinal care.</p>',
      tags: ['spine', 'spinal surgery', 'MIS', 'pedicle screws', 'fusion', 'vertebroplasty'],
      seo: { metaTitle: 'Spine Solution — Spinal Surgery & MIS Systems | PRE-MED', metaDescription: 'Pre-sterile, single-use spinal systems and minimally invasive surgery solutions for safer, faster recoveries in Saudi Arabia.', metaKeywords: ['spine solution', 'spinal surgery', 'MIS spine', 'pedicle screws', 'interbody fusion'] },
    },
    // ── 6. Radiology Solution ──
    {
      title: 'Radiology Solution', slug: 'radiology-solution', language: 'en', isActive: true,
      subtitle: 'Diagnostic & Interventional Imaging Systems', featured: true, order: 5,
      featuredImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80',
      excerpt: 'Comprehensive radiology solutions – from diagnostic imaging consumables and contrast media to interventional radiology devices and radiation protection equipment.',
      content: '<h2>Radiology Solution</h2><p>PRE-MED supports radiology departments with a curated portfolio of diagnostic and interventional radiology products that enhance imaging quality, procedural precision, and patient safety.</p><h3>Product Range</h3><ul><li>Diagnostic imaging consumables and accessories</li><li>Contrast media and injection systems</li><li>Interventional radiology catheters and guidewires</li><li>Radiation protection equipment and shielding</li><li>Image-guided biopsy systems</li><li>PACS and imaging workflow solutions</li></ul><h3>Integration with Surgery</h3><p>Modern orthopedic and spinal surgery depends heavily on intraoperative imaging. Our radiology solutions integrate seamlessly with our surgical portfolio, supporting image-guided navigation and fluoroscopy-assisted procedures.</p>',
      tags: ['radiology', 'diagnostic imaging', 'interventional radiology', 'contrast media', 'radiation protection'],
      seo: { metaTitle: 'Radiology Solution — Diagnostic & Interventional Imaging | PRE-MED', metaDescription: 'Comprehensive radiology solutions – diagnostic imaging consumables, interventional devices, and radiation protection equipment.', metaKeywords: ['radiology solution', 'diagnostic imaging', 'interventional radiology', 'contrast media'] },
    },
    // ── 7. General Surgery Solution ──
    {
      title: 'General Surgery Solution', slug: 'general-surgery-solution', language: 'en', isActive: true,
      subtitle: 'Surgical Instruments & Operating Room Systems', featured: true, order: 6,
      featuredImage: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&q=80',
      excerpt: 'Premium surgical instruments, energy devices, and operating room systems for general surgical procedures – from laparoscopic to open surgery.',
      content: '<h2>General Surgery Solution</h2><p>PRE-MED provides a comprehensive catalog of general surgery products that equip operating rooms with the instruments, devices, and consumables needed for optimal procedural outcomes across all surgical specialties.</p><h3>Product Range</h3><ul><li>Precision surgical instrument sets – forceps, scissors, retractors, needle holders</li><li>Electrosurgical and energy devices</li><li>Laparoscopic instruments and trocar systems</li><li>Surgical sutures and wound closure materials</li><li>Bone cement and mixing systems</li><li>Surgical drapes, gowns, and sterile supplies</li></ul><h3>Quality Assurance</h3><p>Every instrument is sourced from world-class manufacturers and rigorously inspected to ensure optimal performance, durability, and compliance with SFDA standards.</p>',
      tags: ['general surgery', 'surgical instruments', 'laparoscopic', 'energy devices', 'operating room'],
      seo: { metaTitle: 'General Surgery Solution — Instruments & OR Systems | PRE-MED', metaDescription: 'Premium surgical instruments, energy devices, and operating room systems for general surgical procedures in Saudi Arabia.', metaKeywords: ['general surgery', 'surgical instruments', 'laparoscopic surgery', 'energy devices'] },
    },
    // ── 8. Ophthalmology (Coming Soon) ──
    {
      title: 'Ophthalmology', slug: 'ophthalmology', language: 'en', isActive: true,
      subtitle: 'Coming Soon', featured: false, order: 7,
      featuredImage: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=400&q=80',
      excerpt: 'Coming Soon – PRE-MED is expanding into ophthalmology with premium surgical solutions for cataract, retinal, and refractive procedures.',
      content: '<h2>Ophthalmology</h2><p><strong>Coming Soon</strong></p><p>PRE-MED is strategically expanding into ophthalmology, bringing the same disciplined approach of exclusive partnerships and clinical excellence to eye care. Our upcoming portfolio will include solutions for cataract surgery, retinal procedures, glaucoma management, and refractive surgery.</p><p>Stay tuned for announcements about our ophthalmology product partnerships and launch timeline.</p>',
      tags: ['ophthalmology', 'coming soon', 'eye surgery', 'cataract'],
      seo: { metaTitle: 'Ophthalmology — Coming Soon | PRE-MED', metaDescription: 'PRE-MED is expanding into ophthalmology with premium surgical solutions for cataract, retinal, and refractive procedures.', metaKeywords: ['ophthalmology', 'eye surgery', 'cataract surgery'] },
    },
    // ── 9. Dental Care (Coming Soon) ──
    {
      title: 'Dental Care', slug: 'dental-care', language: 'en', isActive: true,
      subtitle: 'Coming Soon', featured: false, order: 8,
      featuredImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&q=80',
      excerpt: 'Coming Soon – PRE-MED is entering the dental care market with implant systems, surgical instruments, and restorative solutions.',
      content: '<h2>Dental Care</h2><p><strong>Coming Soon</strong></p><p>PRE-MED is expanding into dental care, leveraging our orthopedic expertise in implant technology and surgical support to deliver premium dental solutions. Our upcoming portfolio will include dental implant systems, surgical guides, bone grafting materials, and restorative components.</p><p>Stay tuned for announcements about our dental care product partnerships and launch timeline.</p>',
      tags: ['dental care', 'coming soon', 'dental implants', 'oral surgery'],
      seo: { metaTitle: 'Dental Care — Coming Soon | PRE-MED', metaDescription: 'PRE-MED is entering the dental care market with implant systems, surgical instruments, and restorative solutions.', metaKeywords: ['dental care', 'dental implants', 'oral surgery'] },
    },
    // ── 10. Medical Consumables (Coming Soon) ──
    {
      title: 'Medical Consumables', slug: 'medical-consumables', language: 'en', isActive: true,
      subtitle: 'Coming Soon', featured: false, order: 9,
      featuredImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
      excerpt: 'Coming Soon – PRE-MED is expanding into medical consumables with a comprehensive range of disposable supplies for hospitals and clinics.',
      content: '<h2>Medical Consumables</h2><p><strong>Coming Soon</strong></p><p>PRE-MED is developing a medical consumables division to provide hospitals with a reliable source of high-quality disposable supplies. Our upcoming portfolio will include surgical gloves, syringes, IV sets, catheters, and other essential consumables.</p><p>Stay tuned for announcements about our medical consumables product line and launch timeline.</p>',
      tags: ['medical consumables', 'coming soon', 'disposables', 'hospital supplies'],
      seo: { metaTitle: 'Medical Consumables — Coming Soon | PRE-MED', metaDescription: 'PRE-MED is expanding into medical consumables with disposable supplies for hospitals and clinics across Saudi Arabia.', metaKeywords: ['medical consumables', 'hospital supplies', 'disposables'] },
    },
    // ── 11. Dialysis (Coming Soon) ──
    {
      title: 'Dialysis', slug: 'dialysis', language: 'en', isActive: true,
      subtitle: 'Coming Soon', featured: false, order: 10,
      featuredImage: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&q=80',
      excerpt: 'Coming Soon – PRE-MED is entering the dialysis market with hemodialysis machines, consumables, and renal care solutions.',
      content: '<h2>Dialysis</h2><p><strong>Coming Soon</strong></p><p>PRE-MED is expanding into renal care, bringing premium dialysis equipment and consumables to Saudi Arabia\'s growing nephrology sector. Our upcoming portfolio will include hemodialysis machines, dialyzers, bloodlines, water treatment systems, and peritoneal dialysis solutions.</p><p>Stay tuned for announcements about our dialysis product partnerships and launch timeline.</p>',
      tags: ['dialysis', 'coming soon', 'hemodialysis', 'renal care', 'nephrology'],
      seo: { metaTitle: 'Dialysis — Coming Soon | PRE-MED', metaDescription: 'PRE-MED is entering the dialysis market with hemodialysis machines, consumables, and renal care solutions.', metaKeywords: ['dialysis', 'hemodialysis', 'renal care', 'nephrology'] },
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
