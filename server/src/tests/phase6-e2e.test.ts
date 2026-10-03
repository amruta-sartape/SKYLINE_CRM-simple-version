import assert from 'assert';
import { seedDatabase } from '../db/seed.js';
import { AuthService } from '../services/auth.service.js';
import { PropertyListingService } from '../services/propertyListing.service.js';
import { EnquiryService } from '../services/enquiry.service.js';
import { SiteVisitService } from '../services/siteVisit.service.js';
import { FollowUpService } from '../services/followUp.service.js';
import { JWTPayload, UserRole } from '../types/index.js';

async function runTests() {
  console.log('\n================================================================');
  console.log('   SKYLINE CRM - COMPLETE END-TO-END CUSTOMER & CRM WORKFLOW');
  console.log('================================================================\n');

  await seedDatabase();

  const customerAuth = await AuthService.login({ email: 'customer@skylinecrm.com', password: 'SkylineCustomer2026!' });
  const adminAuth = await AuthService.login({ email: 'admin@skylinecrm.com', password: 'SkylineAdmin2026!' });

  const customerPayload: JWTPayload = { userId: customerAuth.user.id, email: customerAuth.user.email, roles: customerAuth.user.roles };
  const adminPayload: JWTPayload = { userId: adminAuth.user.id, email: adminAuth.user.email, roles: adminAuth.user.roles };

  console.log('--- 1. Customer Discovers Property & Submits Enquiry ---');
  const properties = await PropertyListingService.listProperties({}, customerPayload);
  assert(properties.properties.length > 0, 'Properties available');
  const targetProp = properties.properties[0];

  const enquiry = await EnquiryService.createEnquiry({
    customer_name: 'Aarav Mehta',
    phone: '+1 (555) 123-4567',
    email: 'customer@skylinecrm.com',
    budget: targetProp.price,
    interested_property: targetProp.title,
    configuration: '3 BHK',
    lead_source: 'Website',
    property_id: targetProp.id,
  }, customerPayload.userId);
  assert(enquiry.id, 'Customer enquiry created');
  console.log(`  ✅ PASS: Customer submitted enquiry for ${targetProp.title}.`);

  console.log('\n--- 2. Customer Requests Site Visit ---');
  const todayStr = new Date().toISOString().split('T')[0];
  const visit = await SiteVisitService.create({
    customer_name: 'Aarav Mehta',
    phone: '+1 (555) 123-4567',
    email: 'customer@skylinecrm.com',
    property_id: targetProp.id,
    visit_date: todayStr,
    visit_time: '14:00',
    visit_type: 'Direct Visit',
    remarks: 'Customer requested afternoon walkthrough.',
  }, customerPayload.userId);
  assert(visit.id, 'Site visit created');
  console.log('  ✅ PASS: Site visit scheduled successfully.');

  console.log('\n--- 3. Customer Data Isolation Check ---');
  const myEnquiries = await EnquiryService.getEnquiries({}, customerPayload);
  assert(myEnquiries.enquiries.every((e) => e.email === 'customer@skylinecrm.com' || e.created_by === customerPayload.userId), 'Customer only sees own enquiries');

  const myVisits = await SiteVisitService.list({}, customerPayload);
  assert(myVisits.visits.every((v) => v.customer_email === 'customer@skylinecrm.com' || v.created_by === customerPayload.userId), 'Customer only sees own visits');
  console.log('  ✅ PASS: Customer data isolation strictly verified.');

  console.log('\n================================================================');
  console.log('   ALL E2E CRM & CUSTOMER WORKFLOWS PASSED 100%');
  console.log('================================================================\n');
}

runTests().then(() => process.exit(0)).catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
