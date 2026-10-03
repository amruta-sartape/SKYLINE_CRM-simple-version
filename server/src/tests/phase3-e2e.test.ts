import assert from 'assert';
import { seedDatabase } from '../db/seed.js';
import { ProjectService } from '../services/project.service.js';
import { UnitService } from '../services/unit.service.js';
import { AmenityService } from '../services/amenity.service.js';

async function runTests() {
  console.log('\n================================================================');
  console.log('   SKYLINE CRM - PROPERTY INVENTORY & PROJECTS TEST SUITE');
  console.log('================================================================\n');

  await seedDatabase();

  console.log('--- 1. Amenities Catalog ---');
  const amenities = await AmenityService.listAmenities();
  assert(amenities.length >= 10, 'Amenities list fetched from MongoDB');
  console.log(`  ✅ PASS: Fetched ${amenities.length} active amenities.`);

  console.log('\n--- 2. Master Projects Catalog ---');
  const projectList = await ProjectService.listProjects();
  assert(projectList.projects.length >= 4, 'Projects list fetched from MongoDB');
  const firstProj = projectList.projects[0];
  assert(firstProj.wings && firstProj.wings.length > 0, 'Project has embedded wings');
  console.log(`  ✅ PASS: Project ${firstProj.name} has ${firstProj.wings.length} wings.`);

  console.log('\n--- 3. Inventory Units & Floor Matrix ---');
  const unitList = await UnitService.listUnits();
  assert(unitList.total >= 10, 'Units fetched from MongoDB');
  console.log(`  ✅ PASS: Total inventory units: ${unitList.total}.`);

  const summary = await UnitService.getInventorySummary();
  assert(summary.total_units > 0, 'Inventory summary calculated');
  assert(summary.available_units > 0, 'Available units counted');

  const matrix = await UnitService.getFloorMatrix(firstProj.id, firstProj.wings[0].id);
  assert(matrix && matrix.floors.length > 0, 'Floor matrix generated');
  console.log('  ✅ PASS: Floor Matrix generated accurately.');

  console.log('\n================================================================');
  console.log('   INVENTORY & PROJECTS SUITE PASSED');
  console.log('================================================================\n');
}

runTests().then(() => process.exit(0)).catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
