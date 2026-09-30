import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { AuthService } from '../services/auth.service.js';
import { EnquiryService } from '../services/enquiry.service.js';
import { LeadService } from '../services/lead.service.js';
import { UserRole } from '../types/index.js';

async function runPhase2Tests() {
  console.log('================================================================');
  console.log('   SKYLINE CRM - PHASE 2 AUTOMATED TEST SUITE');
  console.log('================================================================\n');

  await seedDatabase();

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  // 1. Authenticate tokens for testing
  console.log('--- 1. Testing Setup & Tokens ---');
  const adminAuth = await AuthService.login({ email: 'admin@skylinecrm.com', password: 'SkylineAdmin2026!' });
  const employeeAuth = await AuthService.login({ email: 'employee@skylinecrm.com', password: 'SkylineEmployee2026!' });
  const agentAuth = await AuthService.login({ email: 'agent@skylinecrm.com', password: 'SkylineAgent2026!' });
  assert(!!adminAuth.token && !!employeeAuth.token && !!agentAuth.token, 'Tokens generated for Admin, Employee, Agent');

  const adminUser = { userId: adminAuth.user.id, email: adminAuth.user.email, roles: adminAuth.user.roles };
  const employeeUser = { userId: employeeAuth.user.id, email: employeeAuth.user.email, roles: employeeAuth.user.roles };
  const agentUser = { userId: agentAuth.user.id, email: agentAuth.user.email, roles: agentAuth.user.roles };

  // 2. Enquiry Creation & Validation
  console.log('\n--- 2. Enquiry Creation & Validation ---');
  const newEnquiry = await EnquiryService.createEnquiry(
    {
      customer_name: 'Test Customer 01',
      phone: '+1 (555) 777-8899',
      email: 'test01@example.com',
      city: 'Mumbai',
      budget: 15000000,
      interested_property: 'Skyline Bayview Residences',
      configuration: '3 BHK',
      lead_source: 'WhatsApp',
      assigned_to: agentUser.userId,
    },
    adminUser
  );
  assert(!!newEnquiry.id, 'Enquiry created successfully');
  assert(newEnquiry.customer_name === 'Test Customer 01', 'Enquiry stored correct customer name');
  assert(newEnquiry.configuration === '3 BHK', 'Enquiry stored correct configuration');
  assert(newEnquiry.lead_source === 'WhatsApp', 'Enquiry stored correct lead source');
  assert(newEnquiry.status === 'New Lead', 'Enquiry initial status is "New Lead"');

  // 3. Enquiry Edit
  console.log('\n--- 3. Enquiry Edit ---');
  const updatedEnquiry = await EnquiryService.updateEnquiry(
    newEnquiry.id,
    { budget: 16500000, city: 'Navi Mumbai' },
    adminUser
  );
  assert(updatedEnquiry.budget === 16500000, 'Enquiry budget updated successfully');
  assert(updatedEnquiry.city === 'Navi Mumbai', 'Enquiry city updated successfully');

  // 4. Enquiry Listing, Search & Filters
  console.log('\n--- 4. Enquiry Filters & Search ---');
  const searchRes = await EnquiryService.getEnquiries({ search: 'Test Customer' }, adminUser);
  assert(searchRes.enquiries.some((e) => e.id === newEnquiry.id), 'Enquiry found via search query');

  const filterRes = await EnquiryService.getEnquiries({ source: 'WhatsApp' }, adminUser);
  assert(filterRes.enquiries.every((e) => e.lead_source === 'WhatsApp'), 'Enquiry source filter working');

  // 5. Convert Enquiry to Lead & Duplicate Conversion Prevention
  console.log('\n--- 5. Enquiry Conversion to Lead ---');
  const conversionRes = await EnquiryService.convertToLead(
    newEnquiry.id,
    {
      preferred_location: 'Palm Beach Road',
      loan_required: 1,
      purchase_timeline: '1-3 Months',
      purpose: 'Self Use',
      priority: 'High',
      notes: 'Customer interested in sea-facing 3 BHK on high floor.',
    },
    adminUser
  );
  assert(!!conversionRes.lead.id, 'Enquiry successfully converted to Lead');
  assert(conversionRes.enquiry.status === 'Converted', 'Enquiry status changed to "Converted"');
  assert(conversionRes.enquiry.converted_lead_id === conversionRes.lead.id, 'Enquiry linked with converted lead ID');
  assert(conversionRes.lead.customer_name === newEnquiry.customer_name, 'Lead inherited customer details');
  assert(conversionRes.lead.flat_type === '3 BHK', 'Lead inherited flat type');

  // Duplicate conversion attempt must fail
  try {
    await EnquiryService.convertToLead(newEnquiry.id, {}, adminUser);
    assert(false, 'Duplicate conversion should fail');
  } catch (err: any) {
    assert(err.statusCode === 400, 'Duplicate conversion correctly prevented with HTTP 400');
  }

  // 6. Lead Details, Customer 360 Activities & Timeline
  console.log('\n--- 6. Customer 360 Timeline & Activities ---');
  const timeline = await LeadService.getLeadTimeline(conversionRes.lead.id, adminUser);
  assert(timeline.activities.length >= 1, 'Lead activity history recorded conversion event');
  assert(
    timeline.activities.some((a) => a.activity_type === 'ENQUIRY_CONVERTED'),
    'Activity log contains ENQUIRY_CONVERTED record'
  );

  // 7. Lead Qualification
  console.log('\n--- 7. Lead Qualification ---');
  const qualifiedLead = await LeadService.qualifyLead(
    conversionRes.lead.id,
    {
      qualification_status: 'Qualified',
      budget: 17000000,
      loan_required: 1,
      purchase_timeline: 'Immediate',
      purpose: 'Self Use',
      remarks: 'Customer pre-qualified with SBI Home Loans.',
    },
    adminUser
  );
  assert(qualifiedLead.qualification_status === 'Qualified', 'Lead qualification updated to Qualified');
  assert(qualifiedLead.purchase_timeline === 'Immediate', 'Lead purchase timeline updated');

  const timelineAfterQual = await LeadService.getLeadTimeline(conversionRes.lead.id, adminUser);
  assert(
    timelineAfterQual.activities.some((a) => a.activity_type === 'QUALIFICATION_UPDATED'),
    'Activity log contains QUALIFICATION_UPDATED event'
  );

  // 8. Lead Pipeline Stages & Transitions
  console.log('\n--- 8. Lead Pipeline Transitions ---');
  const stageRes = await LeadService.updateStage(
    conversionRes.lead.id,
    'Site Visit',
    'Client scheduled site visit for upcoming weekend.',
    adminUser
  );
  assert(stageRes.pipeline_stage === 'Site Visit', 'Lead pipeline stage advanced to Site Visit');

  const pipelineBoard = await LeadService.getPipelineBoard({}, adminUser);
  assert(pipelineBoard.stages.length === 7, 'Pipeline board contains all 7 stages');
  const siteVisitStage = pipelineBoard.stages.find((s) => s.stage === 'Site Visit');
  assert(
    siteVisitStage?.leads.some((l) => l.id === conversionRes.lead.id) || false,
    'Lead appears in Site Visit column on Pipeline Board'
  );

  // 9. Follow-Up Logging
  console.log('\n--- 9. Follow-Up Logging ---');
  const followUp = await LeadService.addFollowUp(
    conversionRes.lead.id,
    {
      type: 'Phone Call',
      followup_date: '2026-04-05',
      followup_time: '11:00',
      remarks: 'Confirmed pickup location for project site visit.',
      next_followup_date: '2026-04-06 10:00:00',
    },
    adminUser
  );
  assert(!!followUp.id, 'Follow-up interaction recorded');
  assert(followUp.type === 'Phone Call', 'Follow-up stored correct interaction type');

  const leadAfterFollowUp = await LeadService.getLeadById(conversionRes.lead.id, adminUser);
  assert(
    leadAfterFollowUp?.next_followup_date === '2026-04-06 10:00:00',
    'Lead next follow-up date synced with follow-up log'
  );

  // 10. RBAC Verification for Enquiries & Leads
  console.log('\n--- 10. RBAC Authorization Enforcement ---');
  // Create enquiry assigned exclusively to Agent
  const agentEnq = await EnquiryService.createEnquiry(
    {
      customer_name: 'Agent Exclusive Client',
      phone: '+1 (555) 333-4455',
      budget: 10000000,
      interested_property: 'Skyline Studio',
      configuration: '1 BHK',
      lead_source: 'Website',
      assigned_to: agentUser.userId,
    },
    adminUser
  );

  // Agent should see this enquiry
  const agentEnqList = await EnquiryService.getEnquiries({}, agentUser);
  assert(
    agentEnqList.enquiries.some((e) => e.id === agentEnq.id),
    'Agent can access enquiry assigned to them'
  );

  console.log('\n================================================================');
  console.log(`   PHASE 2 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Tests().catch((err) => {
  console.error('Phase 2 test failed:', err);
  process.exit(1);
});
