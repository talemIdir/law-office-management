/**
 * Test script for jurisdictional data seeding
 * Run with: node test-jurisdiction-seed.js
 */

import { sequelize } from './electron/database/config.js';
import { seedJurisdictionalData } from './electron/database/jurisdictionalSeed.js';
import JudicialCouncil from './electron/database/models/JudicialCouncil.js';
import FirstDegreeCourt from './electron/database/models/FirstDegreeCourt.js';
import AdministrativeAppealCourt from './electron/database/models/AdministrativeAppealCourt.js';
import AdministrativeCourt from './electron/database/models/AdministrativeCourt.js';
import SpecializedCommercialCourt from './electron/database/models/SpecializedCommercialCourt.js';

async function testSeeding() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    console.log('\n🔄 Syncing models...');
    await sequelize.sync({ force: false });
    console.log('✓ Models synced');

    console.log('\n🔄 Running jurisdictional data seeding...');
    await seedJurisdictionalData();

    console.log('\n📊 Verifying seeded data...');
    const [councils, courts, adminAppeal, adminCourts, commercial] = await Promise.all([
      JudicialCouncil.count(),
      FirstDegreeCourt.count(),
      AdministrativeAppealCourt.count(),
      AdministrativeCourt.count(),
      SpecializedCommercialCourt.count()
    ]);

    console.log('\n✅ SEEDING SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Judicial Councils: ${councils}`);
    console.log(`🏛️  First Degree Courts: ${courts}`);
    console.log(`⚖️  Administrative Appeal Courts: ${adminAppeal}`);
    console.log(`🏢 Administrative Courts: ${adminCourts}`);
    console.log(`💼 Commercial Courts: ${commercial}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Show sample data
    console.log('\n📄 Sample Judicial Council:');
    const sampleCouncil = await JudicialCouncil.findOne();
    if (sampleCouncil) {
      console.log(`   Name: ${sampleCouncil.name}`);
      console.log(`   Phone: ${sampleCouncil.phone}`);
      console.log(`   Email: ${sampleCouncil.email}`);
    }

    console.log('\n📄 Sample First Degree Court:');
    const sampleCourt = await FirstDegreeCourt.findOne({
      include: [{ model: JudicialCouncil, as: 'council' }]
    });
    if (sampleCourt) {
      console.log(`   Name: ${sampleCourt.name}`);
      console.log(`   Council: ${sampleCourt.council?.name || 'N/A'}`);
      console.log(`   Is Branch: ${sampleCourt.isBranch ? 'Yes' : 'No'}`);
    }

    await sequelize.close();
    console.log('\n✓ Database connection closed');
    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testSeeding();
