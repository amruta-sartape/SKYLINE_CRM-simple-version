import assert from 'assert';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { ProjectService } from '../services/project.service.js';
import { UnitService } from '../services/unit.service.js';
import { AmenityService } from '../services/amenity.service.js';
import { UserRole } from '../types/index.js';
import { config } from '../config/env.js';

let adminToken: string;
let employeeToken: string;
let agentToken: string;

function makeToken(userId: string, email: string, roles: UserRole[]): string {
  return jwt.sign({ userId, email, roles }, config.jwtSecret, { expiresIn: '1h' });
}

async function runTests() {
  console.log('\n================================================================');
  console.log('   SKYLINE CRM - PHASE 3 AUTOMATED TEST SUITE');
  console.log('   (Property Catalog, Inventory, Floor Matrix & State Machine)');
  console.log('================================================================\n');

  // 1. Setup & Tokens
  console.log('--- 1. Testing Setup & Tokens ---');
  await seedDatabase();

  const adminUser = await db.get<any>('SELECT id, email FROM users WHERE email = ?', [
    'admin@skylinecrm.com',
  ]);
  const empUser = await db.get<any>('SELECT id, email FROM users WHERE email = ?', [
    'employee@skylinecrm.com',
  ]);
  const agentUser = await db.get<any>('SELECT id, email FROM users WHERE email = ?', [
    'agent@skylinecrm.com',
  ]);

  assert(adminUser, 'Admin user should exist in database');
  assert(empUser, 'Employee user should exist in database');
  assert(agentUser, 'Agent user should exist in database');

  adminToken = makeToken(adminUser.id, adminUser.email, [UserRole.ADMIN]);
  employeeToken = makeToken(empUser.id, empUser.email, [UserRole.EMPLOYEE]);
  agentToken = makeToken(agentUser.id, agentUser.email, [UserRole.AGENT]);

  console.log('  ✅ PASS: Tokens generated for Admin, Employee, Agent');

  // 2. Amenities Master Test
  console.log('\n--- 2. Amenities Master Verification ---');
  const amenities = await AmenityService.listAmenities();
  assert(amenities.length >= 8, `Should have seeded at least 8 amenities, found ${amenities.length}`);
  const clubhouse = amenities.find((a) => a.id === 'amn_clubhouse');
  assert(clubhouse, 'Clubhouse amenity should exist');
  console.log(`  ✅ PASS: Amenities seeded and listed correctly (${amenities.length} active amenities)`);

  // 3. Project Creation & Duplicate Code Rejection
  console.log('\n--- 3. Project Creation & Uniqueness Validation ---');
  const testProjectCode = `TEST_${Date.now().toString().slice(-4)}`;
  const project = await ProjectService.createProject(
    {
      name: 'Skyline Pinnacle Towers',
      code: testProjectCode,
      location: 'Viman Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      description: 'Ultra-exclusive residential sanctuary.',
      developer: 'Skyline Realty Group',
      status: 'Active',
      wings: [
        { name: 'Wing Alpha', total_floors: 15, units_per_floor: 4 },
        { name: 'Wing Beta', total_floors: 15, units_per_floor: 4 },
      ],
    },
    adminUser.id
  );

  assert(project.id, 'Project ID should be returned');
  assert.strictEqual(project.name, 'Skyline Pinnacle Towers');
  assert.strictEqual(project.code, testProjectCode);
  assert.strictEqual(project.wings?.length, 2);
  console.log('  ✅ PASS: Project created with multiple wings');

  // Duplicate Code rejection
  let duplicateRejected = false;
  try {
    await ProjectService.createProject(
      {
        name: 'Another Project With Same Code',
        code: testProjectCode,
        location: 'Kothrud',
        city: 'Pune',
        state: 'Maharashtra',
      },
      adminUser.id
    );
  } catch (err: any) {
    duplicateRejected = true;
    assert(err.message.includes('already exists'), 'Should state project code already exists');
  }
  assert(duplicateRejected, 'Duplicate project code MUST be rejected');
  console.log('  ✅ PASS: Duplicate project code rejected by database uniqueness check');

  // 4. Project Search & Filters
  console.log('\n--- 4. Project Search & Filters ---');
  const listSearch = await ProjectService.listProjects({ search: 'Pinnacle' });
  assert(listSearch.projects.some((p) => p.code === testProjectCode), 'Project should be found via search query');

  const listCity = await ProjectService.listProjects({ city: 'Pune' });
  assert(listCity.projects.length >= 1, 'Projects in Pune should be returned');
  console.log('  ✅ PASS: Project search and city filters working');

  // 5. Wing Creation & Uniqueness
  console.log('\n--- 5. Wing Hierarchy & Uniqueness ---');
  const newWing = await ProjectService.createWing(
    project.id,
    { name: 'Wing Gamma', total_floors: 12, units_per_floor: 2 },
    adminUser.id
  );
  assert.strictEqual(newWing.name, 'Wing Gamma');

  let dupWingRejected = false;
  try {
    await ProjectService.createWing(
      project.id,
      { name: 'Wing Gamma', total_floors: 12, units_per_floor: 2 },
      adminUser.id
    );
  } catch (err: any) {
    dupWingRejected = true;
  }
  assert(dupWingRejected, 'Duplicate wing name within same project MUST be rejected');
  console.log('  ✅ PASS: Wing hierarchy and duplicate wing name rejection verified');

  // 6. Unit Creation & Duplicate Prevention
  console.log('\n--- 6. Unit Creation & Duplicate Unit Prevention ---');
  const wingAlpha = project.wings![0];

  const unit101 = await UnitService.createUnit(
    {
      project_id: project.id,
      wing_id: wingAlpha.id,
      unit_number: 'P-101',
      floor: 1,
      configuration: '3 BHK',
      carpet_area: 1450,
      built_up_area: 1900,
      price: 15500000,
      parking_type: 'Included',
      parking_slot: 'Slot-P101',
      availability_status: 'Available',
      facing: 'East Facing (Sunrise)',
      amenity_ids: ['amn_clubhouse', 'amn_pool', 'amn_security'],
    },
    adminUser.id
  );

  assert.strictEqual(unit101.unit_number, 'P-101');
  assert.strictEqual(unit101.floor, 1);
  assert.strictEqual(unit101.configuration, '3 BHK');
  assert.strictEqual(unit101.amenities?.length, 3);
  console.log('  ✅ PASS: Unit created with specifications and amenities link');

  // Duplicate Unit in Same Project & Wing rejection
  let dupUnitRejected = false;
  try {
    await UnitService.createUnit(
      {
        project_id: project.id,
        wing_id: wingAlpha.id,
        unit_number: 'P-101', // Same number
        floor: 1,
        configuration: '2 BHK',
        carpet_area: 1000,
        built_up_area: 1300,
        price: 9000000,
        parking_type: 'Included',
      },
      adminUser.id
    );
  } catch (err: any) {
    dupUnitRejected = true;
    assert(err.message.includes('already exists'), 'Should specify duplicate unit error');
  }
  assert(dupUnitRejected, 'Duplicate unit number in same project & wing MUST be rejected');
  console.log('  ✅ PASS: Duplicate unit (project_id + wing_id + unit_number) correctly rejected');

  // 7. Unit Availability State Machine Transitions
  console.log('\n--- 7. Unit Availability State Machine Verification ---');

  // A. Available -> Reserved (Allowed)
  const reservedUnit = await UnitService.updateAvailability(
    unit101.id,
    { availability_status: 'Reserved', remarks: 'Client token amount submitted for reservation.' },
    adminUser.id,
    UserRole.ADMIN
  );
  assert.strictEqual(reservedUnit.availability_status, 'Reserved');
  console.log('  ✅ PASS: Transition [Available -> Reserved] succeeded');

  // B. Reserved -> Sold (Allowed)
  const soldUnit = await UnitService.updateAvailability(
    unit101.id,
    { availability_status: 'Sold', remarks: 'Agreement registered and booking finalized.' },
    adminUser.id,
    UserRole.ADMIN
  );
  assert.strictEqual(soldUnit.availability_status, 'Sold');
  console.log('  ✅ PASS: Transition [Reserved -> Sold] succeeded');

  // C. Sold -> Reserved (Disallowed: Must throw 400)
  let invalidSoldToReservedRejected = false;
  try {
    await UnitService.updateAvailability(
      unit101.id,
      { availability_status: 'Reserved', remarks: 'Trying illegal transition back to Reserved' },
      adminUser.id,
      UserRole.ADMIN
    );
  } catch (err: any) {
    invalidSoldToReservedRejected = true;
  }
  assert(invalidSoldToReservedRejected, 'Direct transition [Sold -> Reserved] MUST be rejected');
  console.log('  ✅ PASS: Illegal transition [Sold -> Reserved] correctly rejected');

  // D. Sold -> Available (Allowed for Admin cancellation)
  const releasedUnit = await UnitService.updateAvailability(
    unit101.id,
    { availability_status: 'Available', remarks: 'Admin released unit back to inventory pool.' },
    adminUser.id,
    UserRole.ADMIN
  );
  assert.strictEqual(releasedUnit.availability_status, 'Available');
  console.log('  ✅ PASS: Transition [Sold -> Available] (Admin override) succeeded');

  // 8. Multi-faceted Inventory Filters & Search
  console.log('\n--- 8. Inventory Filters & Search ---');

  // Filter by Configuration
  const filterConfig = await UnitService.listUnits({ configuration: '3 BHK' });
  assert(filterConfig.units.every((u) => u.configuration === '3 BHK'), 'All units should be 3 BHK');

  // Filter by Price Range
  const filterPrice = await UnitService.listUnits({ min_price: 8000000, max_price: 16000000 });
  assert(filterPrice.units.every((u) => u.price >= 8000000 && u.price <= 16000000), 'Price filter respected');

  // Filter by Availability
  const filterAvail = await UnitService.listUnits({ availability_status: 'Available' });
  assert(filterAvail.units.every((u) => u.availability_status === 'Available'), 'Availability filter respected');

  console.log('  ✅ PASS: Multi-criteria inventory filtering (config, price range, availability) verified');

  // 9. Visual Floor Matrix Generation
  console.log('\n--- 9. Floor Matrix Generation ---');
  const matrix = await UnitService.getFloorMatrix(project.id, wingAlpha.id);
  assert(matrix, 'Matrix data should be returned');
  assert.strictEqual(matrix.project_name, 'Skyline Pinnacle Towers');
  assert.strictEqual(matrix.wing_name, 'Wing Alpha');
  assert(matrix.floors.length > 0, 'Should contain floor entries');
  console.log(`  ✅ PASS: Floor matrix generated for ${matrix.project_name} [${matrix.wing_name}]`);

  // 10. Inventory Summary Valuation
  console.log('\n--- 10. Inventory Summary Metrics & Valuation ---');
  const summary = await UnitService.getInventorySummary();
  assert(summary.total_units > 0, 'Total units should be greater than 0');
  assert(summary.total_valuation > 0, 'Total inventory valuation should be computed');
  console.log(`  ✅ PASS: Inventory metrics: Total ${summary.total_units} units, ₹${(summary.total_valuation / 10000000).toFixed(2)} Cr valuation`);

  // 11. Property Activities & Audit Logging
  console.log('\n--- 11. Property Activity Audit Logging ---');
  const unitDetail = await UnitService.getUnitById(unit101.id);
  assert(unitDetail, 'Unit detail should exist');
  assert(unitDetail.activities.length >= 3, 'Should record creation and availability change activities');
  assert(unitDetail.activities.some((a) => a.activity_type === 'AVAILABILITY_CHANGED'), 'Should contain AVAILABILITY_CHANGED record');
  console.log(`  ✅ PASS: Property audit timeline recorded ${unitDetail.activities.length} activity events`);

  // 12. Lead & Enquiry Backward Compatibility
  console.log('\n--- 12. Lead & Enquiry Property Integration & Backward Compatibility ---');
  const enquiries = await db.all<any>('SELECT * FROM enquiries WHERE project_id IS NOT NULL');
  assert(enquiries.length > 0, 'Seeded enquiries with project references should exist');

  const leads = await db.all<any>('SELECT * FROM leads WHERE project_id IS NOT NULL');
  assert(leads.length > 0, 'Seeded leads with project references should exist');
  console.log(`  ✅ PASS: Lead & Enquiry backward-compatible property links verified`);

  console.log('\n================================================================');
  console.log('   PHASE 3 TEST SUMMARY: All Test Cases Passed Successfully!');
  console.log('================================================================\n');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Phase 3 test failure:', err);
    process.exit(1);
  });
