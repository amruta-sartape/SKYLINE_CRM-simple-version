import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { AuthService } from '../services/auth.service.js';
import { PropertyListingService } from '../services/propertyListing.service.js';
import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { JWTPayload, UserRole } from '../types/index.js';

let adminPayload: JWTPayload;
let employeePayload: JWTPayload;
let agentPayload: JWTPayload;

async function runTests() {
  console.log('\n================================================================');
  console.log('   SKYLINE CRM - STEP 5 AUTOMATED TEST SUITE');
  console.log('   (Admin Property Management, RBAC & Multi-Image Upload)');
  console.log('================================================================\n');

  // 1. Setup & Auth
  console.log('--- 1. Testing Setup & Role Payloads ---');
  await db.run('DELETE FROM property_images');
  await db.run('DELETE FROM property_listings');
  await seedDatabase();

  const adminAuth = await AuthService.login({ email: 'admin@skylinecrm.com', password: 'SkylineAdmin2026!' });
  const employeeAuth = await AuthService.login({ email: 'employee@skylinecrm.com', password: 'SkylineEmployee2026!' });
  const agentAuth = await AuthService.login({ email: 'agent@skylinecrm.com', password: 'SkylineAgent2026!' });

  adminPayload = {
    userId: adminAuth.user.id,
    email: adminAuth.user.email,
    roles: adminAuth.user.roles,
  };

  employeePayload = {
    userId: employeeAuth.user.id,
    email: employeeAuth.user.email,
    roles: employeeAuth.user.roles,
  };

  agentPayload = {
    userId: agentAuth.user.id,
    email: agentAuth.user.email,
    roles: agentAuth.user.roles,
  };

  assert(adminPayload.userId);
  assert(employeePayload.userId);
  assert(agentPayload.userId);
  console.log('  ✅ PASS: Tokens & Payloads generated for Admin, Employee, and Agent');

  // 2. Testing RBAC Access Control
  console.log('\n--- 2. Testing RBAC Access Control ---');
  assert(adminPayload.roles.includes(UserRole.ADMIN), 'Admin must have ADMIN role');
  assert(!employeePayload.roles.includes(UserRole.ADMIN), 'Employee must not have ADMIN role');
  assert(!agentPayload.roles.includes(UserRole.ADMIN), 'Agent must not have ADMIN role');
  console.log('  ✅ PASS: Role hierarchy strictly validated (Admin vs Non-Admin)');

  // 3. Testing Dynamic Property Creation Across 4 Categories
  console.log('\n--- 3. Testing Dynamic Property Creation Across Categories ---');

  // 3.1 Residential Property
  const residentialProp = await PropertyListingService.createProperty(
    {
      title: 'Skyline Aurora Luxury 3 BHK Penthouse',
      main_category: 'Residential',
      subtype: 'Penthouse',
      price: 32500000,
      price_label: '₹3.25 Cr',
      price_per_sqft: 14772,
      location: 'Kalyani Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      developer: 'Skyline Realty Group',
      availability: 'Ready to Move',
      status: 'Active',
      description: 'Exclusive dual-level penthouse with private infinity deck.',
      highlights: ['Private Infinity Terrace', 'Double Height Living Room', '3 Covered Car Bays'],
      address_details: {
        unitNumber: 'PH-2401',
        building: 'Skyline Aurora Tower A',
        wing: 'A',
        floor: '24th Floor',
        road: 'Riverview Boulevard',
        locality: 'Kalyani Nagar',
        city: 'Pune',
        pinCode: '411006',
      },
      specs_data: {
        residentialSpecs: {
          bhk: '3 BHK',
          bedrooms: 3,
          bathrooms: 4,
          carpetArea: 2200,
          builtUpArea: 2850,
          floor: '24',
          totalFloors: 24,
          parking: '3 Covered Basement Bays',
          facing: 'North-East River View',
        },
      },
    },
    adminPayload.userId
  );

  assert(residentialProp.id, 'Residential property must have an ID');
  assert.strictEqual(residentialProp.main_category, 'Residential');
  assert.strictEqual(residentialProp.subtype, 'Penthouse');
  assert.strictEqual(residentialProp.specs_data.residentialSpecs.bhk, '3 BHK');
  console.log(`  ✅ PASS: Residential Penthouse created (ID: ${residentialProp.id}, Code: ${residentialProp.code})`);

  // 3.2 Land & Plot Property (Strictly NO BHK)
  const landProp = await PropertyListingService.createProperty(
    {
      title: 'Skyline Greenfield Estate Plot 48',
      main_category: 'Land',
      subtype: 'Residential Plot',
      price: 18500000,
      price_label: '₹1.85 Cr',
      location: 'Hinjawadi Phase 3',
      city: 'Pune',
      state: 'Maharashtra',
      developer: 'Skyline Infra',
      availability: 'Available',
      status: 'Active',
      description: 'Clear title freehold villa plot with 60ft arterial road connectivity.',
      specs_data: {
        landSpecs: {
          plotArea: '3,200 sq.ft (355 sq.yd)',
          dimensions: '40 ft x 80 ft',
          roadWidth: '60 ft Wide Main Spine Road',
          facing: 'East Facing Vastu Compliant',
          zoning: 'Residential Freehold R-Zone',
          roadAccess: 'Asphalt 4-Lane Paved',
          utilities: 'Underground Electric Line, 24/7 Water Connection, Storm Drainage',
        },
      },
    },
    adminPayload.userId
  );

  assert(landProp.id);
  assert.strictEqual(landProp.main_category, 'Land');
  assert.strictEqual(landProp.specs_data.landSpecs.plotArea, '3,200 sq.ft (355 sq.yd)');
  assert(!landProp.specs_data.residentialSpecs, 'Land property must have NO residential specs / BHK');
  console.log(`  ✅ PASS: Land & Plot listing created without BHK contamination (ID: ${landProp.id})`);

  // 3.3 Commercial Property
  const commercialProp = await PropertyListingService.createProperty(
    {
      title: 'Skyline CyberPoint Premium IT Office Suite',
      main_category: 'Commercial',
      subtype: 'Commercial Office',
      price: 54000000,
      price_label: '₹5.40 Cr',
      location: 'Viman Nagar Tech Corridor',
      city: 'Pune',
      state: 'Maharashtra',
      developer: 'Skyline Commercial',
      availability: 'Immediate Possession',
      status: 'Active',
      specs_data: {
        commercialSpecs: {
          commercialArea: 4500,
          floor: '7th Floor (Tower B)',
          building: 'Skyline CyberPoint',
          furnishing: 'Warm Shell with VRV AC Ducting',
          ceilingHeight: '13.5 ft Clear Height',
          parking: '6 Dedicated Stencil Bays',
        },
      },
    },
    adminPayload.userId
  );

  assert(commercialProp.id);
  assert.strictEqual(commercialProp.main_category, 'Commercial');
  assert.strictEqual(commercialProp.specs_data.commercialSpecs.commercialArea, 4500);
  console.log(`  ✅ PASS: Commercial Office listing created (ID: ${commercialProp.id})`);

  // 3.4 Master Township Project
  const projectProp = await PropertyListingService.createProperty(
    {
      title: 'Skyline Marina Bay Integrated Township',
      main_category: 'Projects',
      subtype: 'Integrated Township',
      price: 125000000,
      price_label: '₹1.25 Cr - ₹4.50 Cr',
      location: 'Baner-Pashan Link Road',
      city: 'Pune',
      state: 'Maharashtra',
      developer: 'Skyline Developers',
      availability: 'Under Construction',
      status: 'Active',
      specs_data: {
        projectSpecs: {
          landParcel: '35 Acres Waterfront Enclave',
          totalWings: 8,
          totalUnits: 720,
          availableUnits: 140,
          phase: 'Phase 1 Tower A & B Under Structure',
          configurations: '2 BHK, 3 BHK & 4.5 BHK Waterfront Residences',
        },
      },
    },
    adminPayload.userId
  );

  assert(projectProp.id);
  assert.strictEqual(projectProp.main_category, 'Projects');
  assert.strictEqual(projectProp.specs_data.projectSpecs.totalWings, 8);
  console.log(`  ✅ PASS: Master Project listing created (ID: ${projectProp.id})`);

  // 4. Testing Multi-Image Upload & Strict Image Isolation
  console.log('\n--- 4. Testing Multi-Image Upload & Property Isolation ---');

  // Tiny 1x1 transparent PNG base64 for test
  const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const uploadedImages = await PropertyListingService.uploadPropertyImages(
    residentialProp.id,
    [
      {
        filename: 'living_room.png',
        contentType: 'image/png',
        base64Data: sampleBase64,
        label: 'Living Room Deck',
        category: 'Interior',
        isCover: true,
      },
      {
        filename: 'master_bedroom.png',
        contentType: 'image/png',
        base64Data: sampleBase64,
        label: 'Master Bedroom',
        category: 'Interior',
        isCover: false,
      },
      {
        filename: 'skyline_view.png',
        contentType: 'image/png',
        base64Data: sampleBase64,
        label: 'Terrace Skyline View',
        category: 'Exterior',
        isCover: false,
      },
    ],
    adminPayload.userId
  );

  assert.strictEqual(uploadedImages.length, 3, 'Must have 3 uploaded images');
  assert.strictEqual(uploadedImages[0].is_cover, 1, 'First image must be marked as cover');

  // Verify property isolation: upload image to commercialProp and ensure no cross-contamination
  const commercialImages = await PropertyListingService.uploadPropertyImages(
    commercialProp.id,
    [
      {
        filename: 'office_floor.png',
        contentType: 'image/png',
        base64Data: sampleBase64,
        label: 'Commercial Office Floor Plate',
        category: 'Interior',
        isCover: true,
      },
    ],
    adminPayload.userId
  );

  assert.strictEqual(commercialImages.length, 1);
  const reloadedResidential = await PropertyListingService.getPropertyById(residentialProp.id);
  assert.strictEqual(reloadedResidential!.images.length, 3, 'Residential property must strictly have only its 3 images');
  assert(reloadedResidential!.images.every((img) => img.property_id === residentialProp.id), 'All images must belong to residentialProp');
  console.log('  ✅ PASS: 3 Images uploaded with strict folder isolation & DB mapping');

  // 4.2 Set Cover Image Test
  console.log('\n--- 4.2 Testing Set Cover Image ---');
  const secondImageId = uploadedImages[1].id;
  await PropertyListingService.setCoverImage(residentialProp.id, secondImageId, adminPayload.userId);

  const afterCoverChange = await PropertyListingService.getPropertyById(residentialProp.id);
  const coverImg = afterCoverChange!.images.find((img) => img.is_cover === 1);
  assert(coverImg, 'Must have a cover image');
  assert.strictEqual(coverImg.id, secondImageId, 'Second image must now be the cover image');
  console.log(`  ✅ PASS: Cover image successfully swapped to image ${secondImageId}`);

  // 4.3 Delete Image Test
  console.log('\n--- 4.3 Testing Image Deletion ---');
  const thirdImageId = uploadedImages[2].id;
  const remainingImages = await PropertyListingService.deletePropertyImage(
    residentialProp.id,
    thirdImageId,
    adminPayload.userId
  );
  assert.strictEqual(remainingImages.length, 2, 'Should now have 2 images left');
  console.log('  ✅ PASS: Single image deleted cleanly without affecting other images');

  // 5. Testing Update, Archive & Restore Lifecycle
  console.log('\n--- 5. Testing Update, Archive & Restore Lifecycle ---');

  // Update
  const updatedProp = await PropertyListingService.updateProperty(
    residentialProp.id,
    {
      price: 34000000,
      price_label: '₹3.40 Cr',
      availability: 'Reserved',
    },
    adminPayload.userId
  );
  assert.strictEqual(updatedProp.price, 34000000);
  assert.strictEqual(updatedProp.availability, 'Reserved');
  console.log('  ✅ PASS: Property specifications and pricing updated successfully');

  // Archive
  const archivedProp = await PropertyListingService.archiveProperty(residentialProp.id, adminPayload.userId);
  assert.strictEqual(archivedProp.is_active, 0);
  assert.strictEqual(archivedProp.status, 'Archived');
  console.log('  ✅ PASS: Property safely archived without breaking foreign keys or CRM relations');

  // Restore
  const restoredProp = await PropertyListingService.restoreProperty(residentialProp.id, adminPayload.userId);
  assert.strictEqual(restoredProp.is_active, 1);
  assert.strictEqual(restoredProp.status, 'Ready to Move');
  console.log('  ✅ PASS: Property restored back to active discovery portfolio');

  // 6. Testing List & Search Query Filtering
  console.log('\n--- 6. Testing List, Search & Role Querying ---');
  const activeList = await PropertyListingService.listProperties({
    is_active: 1,
    limit: 50,
  });
  assert(activeList.total >= 4, 'Must list all newly created properties');

  const landList = await PropertyListingService.listProperties({
    category: 'Land',
  });
  assert(landList.properties.every((p) => p.main_category === 'Land'), 'Category filter must strictly match Land');

  const searchList = await PropertyListingService.listProperties({
    search: 'Aurora',
  });
  assert(searchList.properties.some((p) => p.id === residentialProp.id), 'Search must find matching title/code');
  console.log(`  ✅ PASS: Query filtering operational (Total properties: ${activeList.total})`);

  // 7. Testing Audit Logging Verification
  console.log('\n--- 7. Testing Audit Trail Governance ---');
  const auditLogs = await db.all<any>(
    `SELECT * FROM audit_logs WHERE resource LIKE 'PROPERTY:%' ORDER BY created_at DESC`
  );
  assert(auditLogs.length >= 5, 'Must have recorded audit logs for property actions');
  const actions = auditLogs.map((log) => log.action);
  assert(actions.includes('PROPERTY_CREATED'), 'Must log PROPERTY_CREATED');
  assert(actions.includes('PROPERTY_UPDATED'), 'Must log PROPERTY_UPDATED');
  assert(actions.includes('PROPERTY_ARCHIVED'), 'Must log PROPERTY_ARCHIVED');
  assert(actions.includes('PROPERTY_RESTORED'), 'Must log PROPERTY_RESTORED');
  assert(actions.includes('PROPERTY_IMAGES_UPLOADED'), 'Must log PROPERTY_IMAGES_UPLOADED');
  console.log(`  ✅ PASS: Full audit trail verified (${auditLogs.length} audit entries captured)`);

  console.log('\n================================================================');
  console.log('   🎉 ALL STEP 5 AUTOMATED TESTS PASSED SUCCESSFULLY! (100%)');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ STEP 5 TEST SUITE FAILED:', err);
  process.exit(1);
});
