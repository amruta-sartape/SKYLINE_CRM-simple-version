import assert from 'assert';
import { AuthService } from '../services/auth.service.js';
import { SiteVisitService } from '../services/siteVisit.service.js';
import { FollowUpService } from '../services/followUp.service.js';
import { LeadService } from '../services/lead.service.js';
import { UnitService } from '../services/unit.service.js';
import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { JWTPayload, UserRole } from '../types/index.js';

let adminPayload: JWTPayload;
let employeePayload: JWTPayload;
let agentPayload: JWTPayload;
let agent2Payload: JWTPayload;

async function runTests() {
  console.log('\n================================================================');
  console.log('   SKYLINE CRM - PHASE 4 AUTOMATED TEST SUITE');
  console.log('   (Site Visits, Follow-ups, Conflict Checks & Lead 360)');
  console.log('================================================================\n');

  // 1. Setup & Auth
  console.log('--- 1. Testing Setup & Role Payloads ---');
  await db.run('DELETE FROM site_visits');
  await db.run('DELETE FROM follow_ups');
  await seedDatabase();

  const adminAuth = await AuthService.login({ email: 'admin@skylinecrm.com', password: 'SkylineAdmin2026!' });
  const employeeAuth = await AuthService.login({ email: 'employee@skylinecrm.com', password: 'SkylineEmployee2026!' });
  const agentAuth = await AuthService.login({ email: 'agent@skylinecrm.com', password: 'SkylineAgent2026!' });
  const agent2Auth = await AuthService.login({ email: 'sophia.agent@skylinecrm.com', password: 'SkylineAgent2026!' });

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

  agent2Payload = {
    userId: agent2Auth.user.id,
    email: agent2Auth.user.email,
    roles: agent2Auth.user.roles,
  };

  assert(adminPayload.userId);
  assert(employeePayload.userId);
  assert(agentPayload.userId);
  console.log('  ✅ PASS: Tokens generated for Admin, Employee, and Agents');

  // 2. Site Visit Creation & Validation
  console.log('\n--- 2. Site Visit Creation & Unit Validation ---');
  const todayStr = new Date().toISOString().split('T')[0];

  const visit = await SiteVisitService.create(
    {
      lead_id: 'lead_001',
      project_id: 'proj_skyline_heights',
      unit_id: 'unt_skh_a_101',
      assigned_user_id: agentPayload.userId,
      visit_date: todayStr,
      visit_time: '14:30',
      visit_type: 'Executive Accompanied',
      remarks: 'Exclusive walkthrough of unit A-101 and luxury rooftop amenities.',
    },
    agentPayload
  );

  assert(visit.id, 'Visit should be created with an ID');
  assert.equal(visit.lead_id, 'lead_001');
  assert.equal(visit.project_id, 'proj_skyline_heights');
  assert.equal(visit.unit_id, 'unt_skh_a_101');
  assert.equal(visit.visit_status, 'Scheduled');
  assert.equal(visit.visit_time, '14:30');
  console.log('  ✅ PASS: Site visit created with valid lead, project, unit, and executive');

  // Cross-project mismatch rejection
  await assert.rejects(
    async () => {
      await SiteVisitService.create(
        {
          lead_id: 'lead_001',
          project_id: 'proj_skyline_bayview', // Mismatched project
          unit_id: 'unt_skh_a_101', // Belongs to skyline_heights
          assigned_user_id: agentPayload.userId,
          visit_date: todayStr,
          visit_time: '16:00',
        },
        adminPayload
      );
    },
    { message: /belong to the chosen property project/ },
    'Must reject mismatched project and unit'
  );
  console.log('  ✅ PASS: Cross-project unit mismatch correctly rejected');

  // 3. Conflict Detection
  console.log('\n--- 3. Conflict Detection: Prevent Executive Double-Booking ---');
  await assert.rejects(
    async () => {
      await SiteVisitService.create(
        {
          lead_id: 'lead_002',
          project_id: 'proj_skyline_bayview',
          assigned_user_id: agentPayload.userId,
          visit_date: todayStr,
          visit_time: '14:30', // Exact conflict slot with visit in test 2
          remarks: 'Conflicting slot attempt',
        },
        adminPayload
      );
    },
    { message: /already has another activity scheduled at this time/ },
    'Must prevent double-booking the same executive'
  );
  console.log('  ✅ PASS: Executive scheduling conflict detection verified');

  // 4. Status Transitions & Outcome Management
  console.log('\n--- 4. Site Visit Status Transitions & Outcome Management ---');
  const visitForCompletion = await SiteVisitService.create(
    {
      lead_id: 'lead_001',
      project_id: 'proj_skyline_heights',
      assigned_user_id: agentPayload.userId,
      visit_date: todayStr,
      visit_time: '09:00',
      remarks: 'Morning site visit test',
    },
    agentPayload
  );

  const completed = await SiteVisitService.updateStatus(
    visitForCompletion.id,
    {
      visit_status: 'Completed',
      outcome: 'Interested',
      remarks: 'Client loved the floor layout and requested quotation.',
    },
    agentPayload
  );

  assert.equal(completed.visit_status, 'Completed');
  assert.equal(completed.outcome, 'Interested');
  console.log('  ✅ PASS: Site visit marked as Completed with outcome and remarks');

  // Illegal status reversal rejection
  await assert.rejects(
    async () => {
      await SiteVisitService.updateStatus(
        visitForCompletion.id,
        {
          visit_status: 'Scheduled',
        },
        adminPayload
      );
    },
    { message: /Completed site visits cannot change status/ },
    'Completed visits cannot revert status'
  );
  console.log('  ✅ PASS: Illegal status transition from Completed correctly rejected');

  // 5. Site Visit Rescheduling
  console.log('\n--- 5. Site Visit Rescheduling with Conflict Check ---');
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const visitForReschedule = await SiteVisitService.create(
    {
      lead_id: 'lead_001',
      project_id: 'proj_skyline_heights',
      assigned_user_id: agentPayload.userId,
      visit_date: todayStr,
      visit_time: '13:00',
    },
    agentPayload
  );

  const rescheduled = await SiteVisitService.reschedule(
    visitForReschedule.id,
    {
      visit_date: tomorrowStr,
      visit_time: '15:00',
      remarks: 'Postponed due to client traffic.',
    },
    agentPayload
  );

  assert.equal(rescheduled.visit_status, 'Rescheduled');
  assert.equal(rescheduled.visit_date, tomorrowStr);
  assert.equal(rescheduled.visit_time, '15:00');
  console.log('  ✅ PASS: Site visit rescheduled with updated date/time and activity log');

  // 6. Property Safety: Unit Availability Invariance
  console.log('\n--- 6. Property Inventory Safety Verification ---');
  const unitBefore = await UnitService.getUnitById('unt_skh_a_101');
  assert.equal(unitBefore?.unit.availability_status, 'Available');

  // Schedule and complete visit for this unit
  const safetyVisit = await SiteVisitService.create(
    {
      lead_id: 'lead_001',
      project_id: 'proj_skyline_heights',
      unit_id: 'unt_skh_a_101',
      assigned_user_id: agentPayload.userId,
      visit_date: '2026-05-10',
      visit_time: '11:00',
    },
    adminPayload
  );

  await SiteVisitService.updateStatus(
    safetyVisit.id,
    {
      visit_status: 'Completed',
      outcome: 'Interested',
    },
    adminPayload
  );

  const unitAfter = await UnitService.getUnitById('unt_skh_a_101');
  assert.equal(unitAfter?.unit.availability_status, 'Available', 'Unit must stay Available');
  console.log('  ✅ PASS: Property inventory availability strictly preserved during site visits');

  // 7. Follow-Up Creation & Supported Types
  console.log('\n--- 7. Follow-Up Creation & Type Validation ---');
  const followUp = await FollowUpService.create(
    {
      lead_id: 'lead_001',
      follow_up_type: 'WhatsApp',
      scheduled_date: todayStr,
      scheduled_time: '15:45',
      remarks: 'Shared brochure and payment plan breakdown via WhatsApp.',
      assigned_user_id: agentPayload.userId,
    },
    agentPayload
  );

  assert(followUp.id);
  assert.equal(followUp.lead_id, 'lead_001');
  assert.equal(followUp.follow_up_type, 'WhatsApp');
  assert.equal(followUp.status, 'Scheduled');
  console.log('  ✅ PASS: Follow-up created with WhatsApp type and assigned executive');

  // Duplicate conflict rejection
  await assert.rejects(
    async () => {
      await FollowUpService.create(
        {
          lead_id: 'lead_001',
          follow_up_type: 'Phone Call',
          scheduled_date: todayStr,
          scheduled_time: '15:45', // Exact conflict
          remarks: 'Duplicate slot attempt',
          assigned_user_id: agentPayload.userId,
        },
        agentPayload
      );
    },
    { message: /already has a follow-up scheduled for this lead at this time/ },
    'Must reject duplicate follow-up on exact time slot'
  );
  console.log('  ✅ PASS: Follow-up duplicate time-slot conflict rejected');

  // 8. Follow-Up Dashboard Views & Dynamic Summary Metrics
  console.log('\n--- 8. Follow-Up Dashboard Views & Summary Counts ---');
  const summary = await FollowUpService.getSummary(adminPayload);

  assert(summary.total >= 6);
  assert(summary.today >= 1);
  assert(summary.overdue >= 1);
  assert(summary.completed >= 1);
  console.log(
    `  ✅ PASS: Follow-up metrics verified (Total: ${summary.total}, Today: ${summary.today}, Overdue: ${summary.overdue}, Completed: ${summary.completed})`
  );

  const overdueList = await FollowUpService.list({ view: 'overdue' }, adminPayload);
  assert(overdueList.followUps.length >= 1);
  assert.equal(overdueList.followUps[0].is_overdue, true);
  console.log('  ✅ PASS: Overdue follow-up calculation and view filtering verified');

  // 9. Follow-Up Completion & Next Follow-Up Auto-Scheduling
  console.log('\n--- 9. Follow-Up Completion & Next Follow-Up Auto-Scheduling ---');
  const fol = await FollowUpService.create(
    {
      lead_id: 'lead_002',
      follow_up_type: 'Phone Call',
      scheduled_date: '2026-04-10',
      remarks: 'Discuss quotation revisions',
      assigned_user_id: agentPayload.userId,
    },
    agentPayload
  );

  const completedFol = await FollowUpService.complete(
    fol.id,
    {
      outcome: 'Client Agreed to Terms',
      remarks: 'Scheduled final registration meeting for tomorrow.',
      next_follow_up_date: `${tomorrowStr} 11:00`,
    },
    agentPayload
  );

  assert.equal(completedFol.status, 'Completed');
  assert.equal(completedFol.outcome, 'Client Agreed to Terms');

  // Verify lead's next_followup_date was updated
  const lead = await LeadService.getLeadById('lead_002', adminPayload);
  assert.equal(lead?.next_followup_date, `${tomorrowStr} 11:00`);

  // Verify new scheduled follow-up was automatically created
  const leadTimeline = await LeadService.getLeadTimeline('lead_002', adminPayload);
  const nextFol = leadTimeline.followUps.find((f: any) => f.scheduled_date === tomorrowStr);
  assert(nextFol, 'Next follow-up should be automatically scheduled');
  assert.equal(nextFol.status, 'Scheduled');
  console.log('  ✅ PASS: Follow-up completion linked with automatic next follow-up creation');

  // 10. RBAC Enforcement: Agent Isolation & Administrative Reassignment
  console.log('\n--- 10. RBAC Enforcement: Agent Isolation & Reassignment ---');
  const visitAssignedToAgent2 = await db.get<any>(
    'SELECT id FROM site_visits WHERE assigned_user_id = ?',
    [agent2Payload.userId]
  );

  if (visitAssignedToAgent2) {
    await assert.rejects(
      async () => {
        await SiteVisitService.getById(visitAssignedToAgent2.id, agentPayload);
      },
      { message: /Access denied/ },
      'Agent cannot view other agents site visits'
    );
    console.log('  ✅ PASS: Agent access isolation verified on Site Visits');
  }

  // Agent cannot reassign visit
  const agentVisit = await db.get<any>(
    'SELECT id FROM site_visits WHERE assigned_user_id = ?',
    [agentPayload.userId]
  );

  await assert.rejects(
    async () => {
      await SiteVisitService.reassign(
        agentVisit.id,
        { assigned_user_id: agent2Payload.userId },
        agentPayload // Non-admin caller
      );
    },
    { message: /Only administrators can reassign/ },
    'Non-admin cannot reassign'
  );
  console.log('  ✅ PASS: Non-admin executive reassignment blocked');

  // Admin CAN reassign visit
  const reassigned = await SiteVisitService.reassign(
    agentVisit.id,
    { assigned_user_id: agent2Payload.userId, remarks: 'Reassigned by sales director.' },
    adminPayload
  );
  assert.equal(reassigned.assigned_user_id, agent2Payload.userId);
  console.log('  ✅ PASS: Administrator successfully reassigned executive');

  // 11. Customer 360 Integration
  console.log('\n--- 11. Customer 360 Unified Lead Timeline ---');
  const timeline = await LeadService.getLeadTimeline('lead_001', adminPayload);

  assert(timeline.activities.length > 0);
  assert(timeline.followUps.length > 0);
  assert(timeline.siteVisits.length > 0);

  const hasVisitEvent = timeline.activities.some((a) => a.activity_type.startsWith('SITE_VISIT'));
  const hasFollowUpEvent = timeline.activities.some((a) => a.activity_type.startsWith('FOLLOW_UP'));

  assert(hasVisitEvent, 'Activity timeline must contain Site Visit events');
  assert(hasFollowUpEvent, 'Activity timeline must contain Follow-Up events');
  console.log(
    `  ✅ PASS: Customer 360 timeline verified with ${timeline.activities.length} activities, ${timeline.followUps.length} follow-ups, ${timeline.siteVisits.length} site visits`
  );

  console.log('\n================================================================');
  console.log('   PHASE 4 TEST SUMMARY: All Test Cases Passed Successfully!');
  console.log('================================================================\n');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Phase 4 Test Suite Failed:\n', err);
    process.exit(1);
  });
