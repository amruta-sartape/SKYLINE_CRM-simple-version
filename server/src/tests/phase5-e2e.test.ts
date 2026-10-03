import assert from 'assert';
import { seedDatabase } from '../db/seed.js';
import { AuthService } from '../services/auth.service.js';
import { PropertyListingService } from '../services/propertyListing.service.js';
import { PropertyListingModel } from '../models/index.js';
import { JWTPayload, UserRole } from '../types/index.js';

let adminPayload: JWTPayload;

async function runTests() {
  console.log('\n================================================================');
  console.log('   SKYLINE CRM - PROPERTY LISTINGS & IMAGES TEST SUITE');
  console.log('================================================================\n');

  await seedDatabase();

  const adminAuth = await AuthService.login({ email: 'admin@skylinecrm.com', password: 'SkylineAdmin2026!' });
  adminPayload = { userId: adminAuth.user.id, email: adminAuth.user.email, roles: adminAuth.user.roles };

  console.log('--- 1. Property Catalog Discovery ---');
  const catalog = await PropertyListingService.listProperties({}, adminPayload);
  assert(catalog.total >= 4, 'Catalog contains properties across categories');
  console.log(`  ✅ PASS: Catalog contains ${catalog.total} properties.`);

  console.log('\n--- 2. Create Dynamic Property Listing ---');
  const newProp = await PropertyListingService.createProperty({
    title: 'Test Luxury Villa Retreat',
    main_category: 'Residential',
    subtype: 'Villa',
    price: 25000000,
    location: 'Lonavala Hills',
    city: 'Pune',
    state: 'Maharashtra',
    highlights: ['Private Infinity Pool', 'Mountain View'],
    specs_data: { bedrooms: 4, bathrooms: 4, carpetArea: 3500 },
  }, adminPayload.userId);
  assert(newProp.id, 'New property created in MongoDB');
  assert(newProp.price_label === '₹2.50 Cr', 'Price formatted correctly');
  console.log(`  ✅ PASS: Created property ${newProp.title} [${newProp.code}].`);

  console.log('\n--- 3. Archive & Restore Property ---');
  const archived = await PropertyListingService.archiveProperty(newProp.id, adminPayload.userId);
  assert(archived.is_active === 0, 'Property marked as inactive');
  assert(archived.status === 'Archived', 'Status updated to Archived');

  const restored = await PropertyListingService.restoreProperty(newProp.id, adminPayload.userId);
  assert(restored.is_active === 1, 'Property restored');
  console.log('  ✅ PASS: Property archive & restore flow verified.');

  console.log('\n================================================================');
  console.log('   PROPERTY LISTINGS & IMAGES SUITE PASSED');
  console.log('================================================================\n');
}

runTests().then(() => process.exit(0)).catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
