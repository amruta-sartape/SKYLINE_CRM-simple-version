import assert from 'assert';
import { AuthService } from '../services/auth.service.js';
import { EnquiryService } from '../services/enquiry.service.js';
import { LeadService } from '../services/lead.service.js';
import { SiteVisitService } from '../services/siteVisit.service.js';
import { FollowUpService } from '../services/followUp.service.js';
import { PropertyListingService } from '../services/propertyListing.service.js';
import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { JWTPayload, UserRole } from '../types/index.js';

let adminPayload: JWTPayload;
let employeePayload: JWTPayload;
let agentPayload: JWTPayload;

async function runTests() {
  console.log('\n================================================================');
  console.log('   SKYLINE CRM - STEP 6 AUTOMATED TEST SUITE');
  console.log('   (Existing CRM Integration & Complete Property-to-Customer Workflow)');
  console.log('================================================================\n');

  // 1. Setup & Seed
  console.log('--- 1. Testing Setup, Authentication & Seed State ---');
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
  console.log('  ✅ PASS: Authenticated payloads verified for Admin, Employee, and Agent.');

  // 2. Discover Property from Catalog
  console.log('\n--- 2. Step 2/3 Discovery: Selecting Property from Catalog ---');
  const catalog = await PropertyListingService.listProperties({}, adminPayload);
  assert(catalog.properties.length > 0, 'Catalog should contain seed properties');
  
  const targetProperty = catalog.properties[0];
  assert(targetProperty.id, 'Target property must have an ID');
  assert(targetProperty.title, 'Target property must have a title');
  console.log(`  ✅ PASS: Selected Target Property: "${targetProperty.title}" (${targetProperty.code}) - ${targetProperty.price_formatted}`);

  // 3. Customer Inbound Enquiry Linked to Property
  console.log('\n--- 3. Step 4/6 Touchpoint: Customer Inbound Enquiry linked to Property ---');
  const enquiry = await EnquiryService.createEnquiry(
    {
      customer_name: 'Ananya Deshmukh',
      phone: '+91 98230 45678',
      email: 'ananya.deshmukh@example.com',
      city: 'Pune',
      budget: 18500000,
      interested_property: targetProperty.title,
      property_id: targetProperty.id,
      configuration: '3 BHK',
      lead_source: 'Website',
      assigned_to: agentPayload.userId,
    },
    adminPayload
  );

  assert(enquiry.id, 'Enquiry ID should be generated');
  assert.strictEqual(enquiry.customer_name, 'Ananya Deshmukh');
  assert.strictEqual(enquiry.property_id, targetProperty.id, 'Enquiry must link directly to property_id');
  assert.strictEqual(enquiry.property_title, targetProperty.title, 'Enquiry query must join property_title');
  assert.strictEqual(enquiry.property_code, targetProperty.code, 'Enquiry query must join property_code');
  assert.strictEqual(enquiry.status, 'New Lead');
  console.log(`  ✅ PASS: Inbound Enquiry logged with Property ID "${enquiry.property_id}" and title "${enquiry.property_title}".`);

  // Verify list enquiry includes joined property details
  const enquiriesList = await EnquiryService.getEnquiries({ search: 'Ananya Deshmukh' }, adminPayload);
  const foundEnquiry = enquiriesList.enquiries.find((e) => e.id === enquiry.id);
  assert(foundEnquiry, 'Created enquiry should be found in search results');
  assert.strictEqual(foundEnquiry.property_id, targetProperty.id);
  assert.strictEqual(foundEnquiry.property_code, targetProperty.code);
  console.log('  ✅ PASS: Enquiry list query returns joined property code and details.');

  // 4. Convert Enquiry to CRM Lead with Property Propagation
  console.log('\n--- 4. Conversion: Converting Enquiry to Qualified Lead ---');
  const { lead } = await EnquiryService.convertToLead(
    enquiry.id,
    {
      preferred_location: 'Kalyani Nagar / Viman Nagar',
      loan_required: 1,
      purchase_timeline: '1-3 Months',
      purpose: 'Self Use',
      assigned_to: agentPayload.userId,
      priority: 'High',
      notes: 'Customer interested after browsing property discovery gallery.',
    },
    adminPayload
  );

  assert(lead.id, 'Lead ID must be generated');
  assert.strictEqual(lead.customer_name, 'Ananya Deshmukh');
  assert.strictEqual(lead.enquiry_id, enquiry.id, 'Lead must reference enquiry');
  assert.strictEqual(lead.property_id, targetProperty.id, 'Lead must inherit property_id from enquiry');
  assert.strictEqual(lead.property_title, targetProperty.title, 'Lead must inherit property_title');
  assert.strictEqual(lead.property_code, targetProperty.code, 'Lead must inherit property_code');
  assert.strictEqual(lead.pipeline_stage, 'New');
  console.log(`  ✅ PASS: Enquiry converted to Lead ${lead.id} with inherited Property ID "${lead.property_id}".`);

  // 5. Schedule Follow-Up for Lead
  console.log('\n--- 5. Engagement: Scheduling Follow-Up with Property Context ---');
  const followUp = await FollowUpService.create(
    {
      lead_id: lead.id,
      assigned_user_id: agentPayload.userId,
      follow_up_type: 'Phone Call',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '14:30',
      remarks: 'Initial phone call to discuss 3 BHK layouts and pricing options.',
      next_follow_up_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    },
    agentPayload
  );

  assert(followUp.id, 'Follow-up ID must be generated');
  assert.strictEqual(followUp.lead_id, lead.id);
  assert.strictEqual(followUp.property_id, targetProperty.id, 'Follow-up query must join property_id from lead');
  assert.strictEqual(followUp.property_code, targetProperty.code, 'Follow-up query must join property_code');
  console.log(`  ✅ PASS: Follow-Up logged and joined with Property "${followUp.property_title}" (${followUp.property_code}).`);

  // 6. Schedule Site Visit for Lead and Property
  console.log('\n--- 6. On-Site Inspection: Scheduling Site Visit linked to Property ---');
  // Lookup project associated with property or seed project
  const project = await db.get<any>('SELECT * FROM property_projects LIMIT 1');
  assert(project, 'Property project must exist');

  const visitDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const siteVisit = await SiteVisitService.create(
    {
      lead_id: lead.id,
      project_id: project.id,
      property_id: targetProperty.id,
      assigned_user_id: agentPayload.userId,
      visit_date: visitDate,
      visit_time: '11:00',
      visit_type: 'Executive Accompanied',
      remarks: 'Customer requested sample apartment walkthrough and view of high-floor units.',
    },
    agentPayload
  );

  assert(siteVisit.id, 'Site Visit ID must be generated');
  assert.strictEqual(siteVisit.lead_id, lead.id);
  assert.strictEqual(siteVisit.property_id, targetProperty.id, 'Site visit must link to property_id');
  assert.strictEqual(siteVisit.visit_status, 'Scheduled');
  console.log(`  ✅ PASS: Site Visit ${siteVisit.id} scheduled for Property "${siteVisit.property_title}" on ${siteVisit.visit_date}.`);

  // 7. Site Visit Status & Outcome Transition
  console.log('\n--- 7. Outcome: Completing Site Visit & Capturing Buyer Feedback ---');
  const completedVisit = await SiteVisitService.updateStatus(
    siteVisit.id,
    {
      visit_status: 'Completed',
      outcome: 'Interested',
      remarks: 'Customer loved the east-facing layout and high ceiling. Requested payment plan.',
    },
    agentPayload
  );

  assert.strictEqual(completedVisit.visit_status, 'Completed');
  assert.strictEqual(completedVisit.outcome, 'Interested');
  console.log(`  ✅ PASS: Site Visit marked as Completed with Outcome "${completedVisit.outcome}".`);

  // 8. Lead Stage Transition to Negotiation
  console.log('\n--- 8. Pipeline Progression: Advancing Lead Stage to Negotiation ---');
  const advancedLead = await LeadService.updateStage(
    lead.id,
    'Negotiation',
    'Customer completed site visit and expressed strong interest in 3 BHK Unit.',
    adminPayload
  );

  assert.strictEqual(advancedLead.pipeline_stage, 'Negotiation');
  console.log(`  ✅ PASS: Lead advanced to pipeline stage "${advancedLead.pipeline_stage}".`);

  // 9. Customer 360 Full Timeline & Property Touchpoint Aggregation
  console.log('\n--- 9. Customer 360: Verifying Complete Property Touchpoint Aggregation ---');
  const customer360 = await LeadService.getLeadTimeline(lead.id, adminPayload);

  assert(customer360.activities.length >= 3, 'Timeline must capture conversion, site visit, and stage changes');
  assert(customer360.propertyInterests, 'Customer 360 must return propertyInterests array');
  assert(customer360.propertyInterests.length > 0, 'propertyInterests should contain customer property touchpoints');

  const matchedProperty = customer360.propertyInterests.find((p) => p.id === targetProperty.id);
  assert(matchedProperty, 'Customer 360 property interests must include target property');
  assert.strictEqual(matchedProperty.title, targetProperty.title);
  assert(matchedProperty.cover_image, 'Property interest item must include cover_image');
  assert(matchedProperty.price_formatted, 'Property interest item must include price_formatted');
  console.log(`  ✅ PASS: Customer 360 contains ${customer360.propertyInterests.length} property touchpoints and ${customer360.activities.length} activities.`);

  // 10. Inventory Safety Verification: Units availability remains intact
  console.log('\n--- 10. Inventory Protection: Confirming Unit Availability Is Untouched ---');
  const unitsAfter = await db.all<any>('SELECT availability_status, COUNT(*) as count FROM property_units GROUP BY availability_status');
  console.log('  Current Unit Availability Distribution:', unitsAfter);
  const reservedUnits = unitsAfter.find((u) => u.availability_status === 'Reserved')?.count || 0;
  assert.strictEqual(reservedUnits, 3, 'Unit availability state machine must not auto-reserve units for site visits or enquiries');
  console.log('  ✅ PASS: Unit availability state machine was strictly protected (0 units auto-reserved).');

  // 11. Cross-Role RBAC Check: Agent vs Admin Permissions
  console.log('\n--- 11. RBAC Check: Agent Lead Access Isolation ---');
  const otherAgentLead = await LeadService.createLead(
    {
      customer_name: 'Vikram Mehta',
      phone: '+91 99887 76655',
      budget: 25000000,
      flat_type: '4 BHK',
      assigned_to: employeePayload.userId, // assigned to employee
    },
    adminPayload
  );

  // Agent should not be able to schedule site visit for another user's lead
  let agentBlocked = false;
  try {
    await SiteVisitService.create(
      {
        lead_id: otherAgentLead.id,
        project_id: project.id,
        assigned_user_id: agentPayload.userId,
        visit_date: visitDate,
        visit_time: '16:00',
      },
      agentPayload
    );
  } catch (err: any) {
    agentBlocked = err.statusCode === 403 || err.message.includes('assigned');
  }
  assert(agentBlocked, 'Agent must not schedule visits for leads assigned to other users');
  console.log('  ✅ PASS: RBAC isolation correctly prevents cross-agent lead modification.');

  console.log('\n================================================================');
  console.log('   🎉 ALL STEP 6 TESTS PASSED SUCCESSFULLY! (11/11 Checks)');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ STEP 6 TEST SUITE FAILED:', err);
  process.exit(1);
});
