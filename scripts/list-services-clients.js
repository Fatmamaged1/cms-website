/**
 * List all services with their partners and all clients.
 * Usage: node scripts/list-services-clients.js
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Service = require('../models/Service');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const Partner = db.collection('partners');
    const Client = db.collection('clients');

    // ── Services with partners ──
    const services = await Service.find().lean();
    console.log(`═══ SERVICES (${services.length}) ═══\n`);

    for (const svc of services) {
      const partnerIds = (svc.partners || []).map(id => typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id);
      let partnerNames = [];
      if (partnerIds.length > 0) {
        const partners = await Partner.find({ _id: { $in: partnerIds } }).toArray();
        partnerNames = partners.map(p => p.name);
      }

      console.log(`  ${svc.title || svc.slug}`);
      console.log(`    ID:       ${svc._id}`);
      console.log(`    Active:   ${svc.isActive !== false ? 'Yes' : 'No'}`);
      console.log(`    Featured: ${svc.featured ? 'Yes' : 'No'}`);
      console.log(`    Partners: ${partnerNames.length > 0 ? partnerNames.join(', ') : '(none)'}`);
      console.log('');
    }

    // ── Clients ──
    const clients = await Client.find().toArray();
    console.log(`═══ CLIENTS (${clients.length}) ═══\n`);

    for (const c of clients) {
      console.log(`  ${c.name || '(unnamed)'}`);
      console.log(`    ID:       ${c._id}`);
      console.log(`    Active:   ${c.isActive !== false ? 'Yes' : 'No'}`);
      console.log(`    Logo:     ${c.logo || '(none)'}`);
      console.log(`    URL:      ${c.url || '(none)'}`);
      console.log('');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
