import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './database.js';
import {
  UserRole,
  UserStatus,
  LeadSource,
  PropertyConfiguration,
  PipelineStage,
  QualificationStatus,
  LeadPriority,
} from '../types/index.js';

export async function seedDatabase(): Promise<void> {
  console.log('[Seed] Starting database seed...');
  await db.initSchema();

  // 1. Seed Roles
  const rolesData = [
    {
      id: 'role_admin',
      name: UserRole.ADMIN,
      description: 'Full system administrator with unrestricted access to all modules and configurations',
    },
    {
      id: 'role_employee',
      name: UserRole.EMPLOYEE,
      description: 'Operations and staff member managing leads, site visits, customer follow-ups, and support',
    },
    {
      id: 'role_agent',
      name: UserRole.AGENT,
      description: 'Real estate sales agent managing inquiries, property deals, client visits, and commissions',
    },
  ];

  for (const role of rolesData) {
    const existing = await db.get('SELECT id FROM roles WHERE name = ?', [role.name]);
    if (!existing) {
      await db.run(
        'INSERT INTO roles (id, name, description) VALUES (?, ?, ?)',
        [role.id, role.name, role.description]
      );
      console.log(`[Seed] Created role: ${role.name}`);
    }
  }

  // 2. Seed Default Accounts
  const seedUsers = [
    {
      id: 'usr_admin_001',
      name: 'Alexander Wright',
      email: 'admin@skylinecrm.com',
      phone: '+1 (555) 234-5678',
      password: 'SkylineAdmin2026!',
      role: UserRole.ADMIN,
      roleId: 'role_admin',
    },
    {
      id: 'usr_employee_001',
      name: 'Eleanor Vance',
      email: 'employee@skylinecrm.com',
      phone: '+1 (555) 345-6789',
      password: 'SkylineEmployee2026!',
      role: UserRole.EMPLOYEE,
      roleId: 'role_employee',
    },
    {
      id: 'usr_agent_001',
      name: 'Marcus Sterling',
      email: 'agent@skylinecrm.com',
      phone: '+1 (555) 456-7890',
      password: 'SkylineAgent2026!',
      role: UserRole.AGENT,
      roleId: 'role_agent',
    },
    {
      id: 'usr_agent_002',
      name: 'Sophia Hayes',
      email: 'sophia.agent@skylinecrm.com',
      phone: '+1 (555) 567-8901',
      password: 'SkylineAgent2026!',
      role: UserRole.AGENT,
      roleId: 'role_agent',
    },
    {
      id: 'usr_agent_003',
      name: 'David Chen',
      email: 'david.sales@skylinecrm.com',
      phone: '+1 (555) 678-9012',
      password: 'SkylineAgent2026!',
      role: UserRole.AGENT,
      roleId: 'role_agent',
    },
  ];

  for (const u of seedUsers) {
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [u.email]);
    if (!existingUser) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await db.run(
        `INSERT INTO users (id, name, email, phone, password_hash, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [u.id, u.name, u.email, u.phone, passwordHash, UserStatus.ACTIVE]
      );

      await db.run(
        `INSERT OR IGNORE INTO user_roles (id, user_id, role_id)
         VALUES (?, ?, ?)`,
        [`ur_${crypto.randomUUID()}`, u.id, u.roleId]
      );

      console.log(`[Seed] Created user: ${u.email} [${u.role}]`);
    }
  }

  // 3. Seed Phase 2 Enquiries
  const sampleEnquiries = [
    {
      id: 'enq_001',
      customer_name: 'Rajesh Sharma',
      phone: '+1 (555) 912-3456',
      email: 'rajesh.sharma@example.com',
      city: 'Mumbai',
      budget: 18500000,
      interested_property: 'Skyline Imperial Towers',
      configuration: '3 BHK' as PropertyConfiguration,
      lead_source: 'Website' as LeadSource,
      assigned_to: 'usr_agent_001',
      status: 'New Lead',
      enquiry_date: '2026-03-28 10:30:00',
      created_by: 'usr_admin_001',
    },
    {
      id: 'enq_002',
      customer_name: 'Pooja Iyer',
      phone: '+1 (555) 923-4567',
      email: 'pooja.iyer@example.com',
      city: 'Bangalore',
      budget: 12000000,
      interested_property: 'Skyline Green Valley',
      configuration: '2 BHK' as PropertyConfiguration,
      lead_source: 'Google Ads' as LeadSource,
      assigned_to: 'usr_employee_001',
      status: 'New Lead',
      enquiry_date: '2026-03-29 14:15:00',
      created_by: 'usr_employee_001',
    },
    {
      id: 'enq_003',
      customer_name: 'Karthik Menon',
      phone: '+1 (555) 934-5678',
      email: 'karthik.menon@example.com',
      city: 'Pune',
      budget: 32000000,
      interested_property: 'Skyline Pinnacle Penthouse',
      configuration: '4 BHK' as PropertyConfiguration,
      lead_source: 'Facebook / Instagram' as LeadSource,
      assigned_to: 'usr_agent_001',
      status: 'In Progress',
      enquiry_date: '2026-03-27 11:00:00',
      created_by: 'usr_admin_001',
    },
    {
      id: 'enq_004',
      customer_name: 'Aditya Birla & Co (Walk-in)',
      phone: '+1 (555) 945-6789',
      email: 'aditya.corp@example.com',
      city: 'Delhi NCR',
      budget: 25000000,
      interested_property: 'Skyline Business Bay Residencies',
      configuration: '3 BHK' as PropertyConfiguration,
      lead_source: 'Walk-in' as LeadSource,
      assigned_to: 'usr_agent_002',
      status: 'New Lead',
      enquiry_date: '2026-03-30 09:45:00',
      created_by: 'usr_agent_002',
    },
    {
      id: 'enq_005',
      customer_name: 'Siddharth Mehta',
      phone: '+1 (555) 956-7890',
      email: 'siddharth.m@example.com',
      city: 'Hyderabad',
      budget: 8500000,
      interested_property: 'Skyline Studio Heights',
      configuration: '1 BHK' as PropertyConfiguration,
      lead_source: 'Property Portal' as LeadSource,
      assigned_to: null, // Unassigned enquiry for assignment testing
      status: 'New Lead',
      enquiry_date: '2026-03-30 11:20:00',
      created_by: 'usr_admin_001',
    },
  ];

  for (const enq of sampleEnquiries) {
    const existing = await db.get('SELECT id FROM enquiries WHERE id = ?', [enq.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO enquiries (id, customer_name, phone, email, city, budget, interested_property,
          configuration, lead_source, assigned_to, status, enquiry_date, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          enq.id,
          enq.customer_name,
          enq.phone,
          enq.email,
          enq.city,
          enq.budget,
          enq.interested_property,
          enq.configuration,
          enq.lead_source,
          enq.assigned_to,
          enq.status,
          enq.enquiry_date,
          enq.created_by,
        ]
      );
      console.log(`[Seed] Created enquiry: ${enq.customer_name} [${enq.interested_property}]`);
    }
  }

  // 4. Seed Phase 2 Leads across Pipeline Stages
  const sampleLeads = [
    {
      id: 'lead_001',
      enquiry_id: null,
      customer_name: 'Vikram Malhotra',
      phone: '+1 (555) 801-1122',
      email: 'vikram.malhotra@techcorp.com',
      city: 'Mumbai',
      budget: 17500000,
      preferred_location: 'Bandra West / Khar',
      flat_type: '3 BHK' as PropertyConfiguration,
      interested_property: 'Skyline Coastal Heights',
      loan_required: 1,
      purchase_timeline: '1-3 Months',
      purpose: 'Self Use',
      assigned_to: 'usr_agent_001',
      pipeline_stage: 'Site Visit' as PipelineStage,
      qualification_status: 'Qualified' as QualificationStatus,
      priority: 'High' as LeadPriority,
      next_followup_date: '2026-04-02 11:00:00',
      notes: 'Customer looking for sea-view balcony with 2 dedicated car parking slots. Loan pre-approved with HDFC Bank.',
      created_by: 'usr_admin_001',
      created_at: '2026-03-20 10:00:00',
    },
    {
      id: 'lead_002',
      enquiry_id: null,
      customer_name: 'Dr. Ananya Deshmukh',
      phone: '+1 (555) 802-2233',
      email: 'dr.ananya@healthcare.org',
      city: 'Pune',
      budget: 28000000,
      preferred_location: 'Kalyani Nagar / Koregaon Park',
      flat_type: '4 BHK' as PropertyConfiguration,
      interested_property: 'Skyline Grandeur Luxury Suites',
      loan_required: 0,
      purchase_timeline: 'Immediate',
      purpose: 'Self Use',
      assigned_to: 'usr_agent_001',
      pipeline_stage: 'Negotiation' as PipelineStage,
      qualification_status: 'Qualified' as QualificationStatus,
      priority: 'Urgent' as LeadPriority,
      next_followup_date: '2026-04-01 16:30:00',
      notes: 'Final price negotiation in progress for 14th floor corner unit. Management discount request submitted.',
      created_by: 'usr_agent_001',
      created_at: '2026-03-18 14:20:00',
    },
    {
      id: 'lead_003',
      enquiry_id: null,
      customer_name: 'Arjun & Sneha Kapoor',
      phone: '+1 (555) 803-3344',
      email: 'arjun.kapoor@finadvisors.com',
      city: 'Bangalore',
      budget: 14000000,
      preferred_location: 'Whitefield / Outer Ring Road',
      flat_type: '2 BHK' as PropertyConfiguration,
      interested_property: 'Skyline TechPark Residences',
      loan_required: 1,
      purchase_timeline: '1-3 Months',
      purpose: 'Investment',
      assigned_to: 'usr_employee_001',
      pipeline_stage: 'Follow-up' as PipelineStage,
      qualification_status: 'Qualified' as QualificationStatus,
      priority: 'Medium' as LeadPriority,
      next_followup_date: '2026-04-03 15:00:00',
      notes: 'Looking for strong rental yield (5%+). Requested ROI breakdown comparison document.',
      created_by: 'usr_employee_001',
      created_at: '2026-03-24 09:15:00',
    },
    {
      id: 'lead_004',
      enquiry_id: null,
      customer_name: 'Meera Nambiar',
      phone: '+1 (555) 804-4455',
      email: 'meera.nambiar@designstudio.com',
      city: 'Chennai',
      budget: 9500000,
      preferred_location: 'OMR Road',
      flat_type: '2 BHK' as PropertyConfiguration,
      interested_property: 'Skyline Urban Oasis',
      loan_required: 1,
      purchase_timeline: '3-6 Months',
      purpose: 'Self Use',
      assigned_to: 'usr_agent_002',
      pipeline_stage: 'Contacted' as PipelineStage,
      qualification_status: 'Future Prospect' as QualificationStatus,
      priority: 'Medium' as LeadPriority,
      next_followup_date: '2026-04-05 10:00:00',
      notes: 'Initial pitch made over WhatsApp. Client reviewing digital e-brochure.',
      created_by: 'usr_agent_002',
      created_at: '2026-03-26 11:45:00',
    },
    {
      id: 'lead_005',
      enquiry_id: null,
      customer_name: 'Gaurav Bansal',
      phone: '+1 (555) 805-5566',
      email: 'gbansal@investments.in',
      city: 'Delhi NCR',
      budget: 35000000,
      preferred_location: 'Golf Course Road / Gurgaon',
      flat_type: '4 BHK' as PropertyConfiguration,
      interested_property: 'Skyline Monarch Residences',
      loan_required: 0,
      purchase_timeline: 'Immediate',
      purpose: 'Self Use',
      assigned_to: 'usr_agent_001',
      pipeline_stage: 'Converted' as PipelineStage,
      qualification_status: 'Qualified' as QualificationStatus,
      priority: 'High' as LeadPriority,
      next_followup_date: null,
      notes: 'Agreement draft initiated! Client signed initial booking confirmation token.',
      created_by: 'usr_admin_001',
      created_at: '2026-03-10 16:00:00',
    },
    {
      id: 'lead_006',
      enquiry_id: null,
      customer_name: 'Sunil Chawla',
      phone: '+1 (555) 806-6677',
      email: 'sunil.c@chawlagroup.com',
      city: 'Ahmedabad',
      budget: 6500000,
      preferred_location: 'SG Highway',
      flat_type: '1 BHK' as PropertyConfiguration,
      interested_property: 'Skyline Compact Living',
      loan_required: 0,
      purchase_timeline: '6+ Months',
      purpose: 'Investment',
      assigned_to: 'usr_employee_001',
      pipeline_stage: 'Lost' as PipelineStage,
      qualification_status: 'Not Interested' as QualificationStatus,
      priority: 'Low' as LeadPriority,
      next_followup_date: null,
      notes: 'Client decided to defer real estate investment to next fiscal year. Budget re-allocated.',
      created_by: 'usr_employee_001',
      created_at: '2026-03-12 13:00:00',
    },
    {
      id: 'lead_007',
      enquiry_id: null,
      customer_name: 'Devendra Patel',
      phone: '+1 (555) 807-7788',
      email: 'devendra.patel@patelmotors.com',
      city: 'Mumbai',
      budget: 21000000,
      preferred_location: 'Andheri East',
      flat_type: '3 BHK' as PropertyConfiguration,
      interested_property: 'Skyline Prime Towers',
      loan_required: 1,
      purchase_timeline: 'Immediate',
      purpose: 'Self Use',
      assigned_to: 'usr_agent_001',
      pipeline_stage: 'New' as PipelineStage,
      qualification_status: 'Future Prospect' as QualificationStatus,
      priority: 'High' as LeadPriority,
      next_followup_date: '2026-04-01 10:30:00',
      notes: 'New hot lead converted from luxury property portal advertisement.',
      created_by: 'usr_admin_001',
      created_at: '2026-03-30 08:30:00',
    },
  ];

  for (const lead of sampleLeads) {
    const existing = await db.get('SELECT id FROM leads WHERE id = ?', [lead.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO leads (id, enquiry_id, customer_name, phone, email, city, budget,
          preferred_location, flat_type, interested_property, loan_required, purchase_timeline,
          purpose, assigned_to, pipeline_stage, qualification_status, priority,
          next_followup_date, notes, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lead.id,
          lead.enquiry_id,
          lead.customer_name,
          lead.phone,
          lead.email,
          lead.city,
          lead.budget,
          lead.preferred_location,
          lead.flat_type,
          lead.interested_property,
          lead.loan_required,
          lead.purchase_timeline,
          lead.purpose,
          lead.assigned_to,
          lead.pipeline_stage,
          lead.qualification_status,
          lead.priority,
          lead.next_followup_date,
          lead.notes,
          lead.created_by,
          lead.created_at,
        ]
      );

      // Seed Initial Activities for Customer 360 Timeline
      await db.run(
        `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `act_${crypto.randomUUID()}`,
          lead.id,
          'LEAD_CREATED',
          'Lead Created in System',
          `Lead profile established for ${lead.customer_name} with budget of ₹${(lead.budget / 100000).toFixed(1)} Lakhs.`,
          lead.created_by,
          lead.created_at,
        ]
      );

      if (lead.assigned_to) {
        await db.run(
          `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `act_${crypto.randomUUID()}`,
            lead.id,
            'EXECUTIVE_ASSIGNED',
            'Sales Executive Assigned',
            `Lead assigned to executive for consultation and follow-ups.`,
            lead.created_by,
            lead.created_at,
          ]
        );
      }

      if (lead.pipeline_stage !== 'New') {
        await db.run(
          `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `act_${crypto.randomUUID()}`,
            lead.id,
            'STAGE_CHANGED',
            `Stage Advanced to ${lead.pipeline_stage}`,
            `Lead progression moved to ${lead.pipeline_stage} stage based on client interaction.`,
            lead.assigned_to || lead.created_by,
            lead.created_at,
          ]
        );
      }

      // Seed Sample Follow-up
      await db.run(
        `INSERT INTO follow_ups (id, lead_id, type, followup_date, followup_time, remarks, next_followup_date, executive_id, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `fol_${crypto.randomUUID()}`,
          lead.id,
          'Phone Call',
          '2026-03-29',
          '15:30',
          'Discussed floor plan preferences and project amenities. Scheduled next conversation.',
          lead.next_followup_date,
          lead.assigned_to,
          'Completed',
          lead.created_at,
        ]
      );

      console.log(`[Seed] Created lead: ${lead.customer_name} [Stage: ${lead.pipeline_stage}]`);
    }
  }

  // ============================================================================
  // 5. Seed Phase 3 Amenities
  // ============================================================================
  const amenitiesData = [
    { id: 'amn_clubhouse', name: 'Luxury Clubhouse', category: 'Leisure', icon: 'Building' },
    { id: 'amn_pool', name: 'Infinity Swimming Pool', category: 'Leisure', icon: 'Waves' },
    { id: 'amn_gym', name: 'State-of-the-Art Fitness Gym', category: 'Sports & Wellness', icon: 'Dumbbell' },
    { id: 'amn_security', name: '24/7 Security & CCTV', category: 'Security', icon: 'Shield' },
    { id: 'amn_backup', name: '100% Power Backup', category: 'Convenience', icon: 'Zap' },
    { id: 'amn_parking', name: 'Covered Parking & EV Charging', category: 'Convenience', icon: 'Car' },
    { id: 'amn_garden', name: 'Landscaped Zen Garden', category: 'Green Living', icon: 'Trees' },
    { id: 'amn_play_area', name: "Children's Play Zone", category: 'Leisure', icon: 'Sparkles' },
    { id: 'amn_lift', name: 'High-Speed Elevators', category: 'Convenience', icon: 'Building' },
    { id: 'amn_jogging', name: 'Rooftop Jogging Track', category: 'Sports & Wellness', icon: 'Activity' },
    { id: 'amn_ev', name: 'EV Charging Station', category: 'Green Living', icon: 'Zap' },
  ];

  for (const a of amenitiesData) {
    const existing = await db.get('SELECT id FROM amenities WHERE id = ?', [a.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO amenities (id, name, category, icon, is_active) VALUES (?, ?, ?, ?, 1)`,
        [a.id, a.name, a.category, a.icon]
      );
      console.log(`[Seed] Created amenity: ${a.name}`);
    }
  }

  // ============================================================================
  // 6. Seed Phase 3 Projects & Wings
  // ============================================================================
  const projectsData = [
    {
      id: 'proj_skyline_heights',
      name: 'Skyline Heights',
      code: 'SKH',
      location: 'Kharadi IT Corridor',
      city: 'Pune',
      state: 'Maharashtra',
      description: 'Ultra-luxury high-rise residential towers with panoramic river and IT park views.',
      developer: 'Skyline Realty Group',
      status: 'Active',
      total_wings: 3,
      wings: [
        { id: 'wng_skh_a', name: 'Wing A', total_floors: 12, units_per_floor: 4 },
        { id: 'wng_skh_b', name: 'Wing B', total_floors: 12, units_per_floor: 4 },
        { id: 'wng_skh_c', name: 'Wing C', total_floors: 10, units_per_floor: 2 },
      ],
    },
    {
      id: 'proj_skyline_bayview',
      name: 'Skyline Bayview',
      code: 'SKB',
      location: 'Marine Drive, South Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      description: 'Signature sea-facing super-luxury residences overlooking the Arabian Sea.',
      developer: 'Skyline Realty Group',
      status: 'Active',
      total_wings: 2,
      wings: [
        { id: 'wng_skb_t1', name: 'Tower 1', total_floors: 20, units_per_floor: 2 },
        { id: 'wng_skb_t2', name: 'Tower 2', total_floors: 20, units_per_floor: 2 },
      ],
    },
    {
      id: 'proj_skyline_grandeur',
      name: 'Skyline Grandeur',
      code: 'SKG',
      location: 'Whitefield Tech Corridor',
      city: 'Bangalore',
      state: 'Karnataka',
      description: 'Smart eco-conscious gated community apartments nestled among lush greenery.',
      developer: 'Skyline Realty Group',
      status: 'Active',
      total_wings: 2,
      wings: [
        { id: 'wng_skg_alpha', name: 'Wing Alpha', total_floors: 10, units_per_floor: 4 },
        { id: 'wng_skg_beta', name: 'Wing Beta', total_floors: 10, units_per_floor: 4 },
      ],
    },
    {
      id: 'proj_skyline_oasis',
      name: 'Skyline Oasis',
      code: 'SKO',
      location: 'Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      description: 'Exclusive low-density enclave of boutique luxury sky villas and duplexes.',
      developer: 'Skyline Realty Group',
      status: 'Upcoming',
      total_wings: 1,
      wings: [
        { id: 'wng_sko_1', name: 'Wing 1', total_floors: 6, units_per_floor: 2 },
      ],
    },
  ];

  for (const p of projectsData) {
    const existing = await db.get('SELECT id FROM property_projects WHERE id = ?', [p.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO property_projects (id, name, code, location, city, state, description, developer, status, total_wings, total_units, is_active, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 'usr_admin_001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [p.id, p.name, p.code, p.location, p.city, p.state, p.description, p.developer, p.status, p.total_wings]
      );

      for (const w of p.wings) {
        await db.run(
          `INSERT INTO property_wings (id, project_id, name, total_floors, units_per_floor, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [w.id, p.id, w.name, w.total_floors, w.units_per_floor]
        );
      }

      await db.run(
        `INSERT INTO property_activities (id, resource_type, resource_id, activity_type, title, description, performed_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          `pact_${crypto.randomUUID()}`,
          'PROJECT',
          p.id,
          'PROJECT_CREATED',
          `Project ${p.name} Initialized`,
          `Master project catalog entry created with ${p.wings.length} wings.`,
          'usr_admin_001',
        ]
      );

      console.log(`[Seed] Created project: ${p.name} with ${p.wings.length} wings`);
    }
  }

  // ============================================================================
  // 7. Seed Property Units / Inventory
  // ============================================================================
  const unitsData = [
    // --- Skyline Heights: Wing A ---
    {
      id: 'unt_skh_a_101',
      project_id: 'proj_skyline_heights',
      wing_id: 'wng_skh_a',
      unit_number: 'A-101',
      floor: 1,
      configuration: '2 BHK',
      carpet_area: 850,
      built_up_area: 1100,
      price: 8500000,
      parking_type: 'Included',
      parking_slot: 'P-A101',
      availability_status: 'Available',
      facing: 'East (Garden View)',
      description: 'Well-ventilated 2 BHK apartment with morning sunlight and landscaped garden view.',
      amenity_ids: ['amn_clubhouse', 'amn_security', 'amn_backup', 'amn_parking', 'amn_lift'],
    },
    {
      id: 'unt_skh_a_102',
      project_id: 'proj_skyline_heights',
      wing_id: 'wng_skh_a',
      unit_number: 'A-102',
      floor: 1,
      configuration: '2 BHK',
      carpet_area: 875,
      built_up_area: 1140,
      price: 8750000,
      parking_type: 'Included',
      parking_slot: 'P-A102',
      availability_status: 'Reserved',
      facing: 'North-East',
      description: 'Spacious 2 BHK unit with modular fittings and premium balcony view.',
      amenity_ids: ['amn_clubhouse', 'amn_pool', 'amn_security', 'amn_backup', 'amn_parking'],
    },
    {
      id: 'unt_skh_a_201',
      project_id: 'proj_skyline_heights',
      wing_id: 'wng_skh_a',
      unit_number: 'A-201',
      floor: 2,
      configuration: '3 BHK',
      carpet_area: 1350,
      built_up_area: 1750,
      price: 13800000,
      parking_type: 'Included',
      parking_slot: 'P-A201',
      availability_status: 'Available',
      facing: 'East',
      description: 'Luxury 3 BHK residence with expansive living room and master suite deck.',
      amenity_ids: ['amn_clubhouse', 'amn_pool', 'amn_gym', 'amn_security', 'amn_backup', 'amn_parking'],
    },
    {
      id: 'unt_skh_a_202',
      project_id: 'proj_skyline_heights',
      wing_id: 'wng_skh_a',
      unit_number: 'A-202',
      floor: 2,
      configuration: '3 BHK',
      carpet_area: 1400,
      built_up_area: 1820,
      price: 14200000,
      parking_type: 'Included',
      parking_slot: 'P-A202',
      availability_status: 'Sold',
      facing: 'North (River View)',
      description: 'Corner 3 BHK apartment with unobstructed panoramic river view.',
      amenity_ids: ['amn_clubhouse', 'amn_pool', 'amn_gym', 'amn_security', 'amn_backup'],
    },
    {
      id: 'unt_skh_a_301',
      project_id: 'proj_skyline_heights',
      wing_id: 'wng_skh_a',
      unit_number: 'A-301',
      floor: 3,
      configuration: '1 BHK',
      carpet_area: 550,
      built_up_area: 720,
      price: 5800000,
      parking_type: 'Not Included',
      parking_slot: null,
      availability_status: 'Available',
      facing: 'West',
      description: 'Compact and efficient 1 BHK unit tailored for young IT professionals.',
      amenity_ids: ['amn_clubhouse', 'amn_security', 'amn_backup', 'amn_lift'],
    },
    {
      id: 'unt_skh_a_302',
      project_id: 'proj_skyline_heights',
      wing_id: 'wng_skh_a',
      unit_number: 'A-302',
      floor: 3,
      configuration: '2 BHK',
      carpet_area: 900,
      built_up_area: 1180,
      price: 9200000,
      parking_type: 'Included',
      parking_slot: 'P-A302',
      availability_status: 'Available',
      facing: 'East',
      description: 'Bright 2 BHK with Italian marble flooring and automated lighting.',
      amenity_ids: ['amn_clubhouse', 'amn_gym', 'amn_security', 'amn_backup', 'amn_parking'],
    },

    // --- Skyline Heights: Wing B ---
    {
      id: 'unt_skh_b_101',
      project_id: 'proj_skyline_heights',
      wing_id: 'wng_skh_b',
      unit_number: 'B-101',
      floor: 1,
      configuration: '2 BHK',
      carpet_area: 860,
      built_up_area: 1120,
      price: 8600000,
      parking_type: 'Included',
      parking_slot: 'P-B101',
      availability_status: 'Available',
      facing: 'North',
      description: 'Cozy 2 BHK unit with modern open-kitchen concept.',
      amenity_ids: ['amn_clubhouse', 'amn_security', 'amn_backup', 'amn_parking'],
    },
    {
      id: 'unt_skh_b_102',
      project_id: 'proj_skyline_heights',
      wing_id: 'wng_skh_b',
      unit_number: 'B-102',
      floor: 1,
      configuration: '3 BHK',
      carpet_area: 1380,
      built_up_area: 1800,
      price: 14000000,
      parking_type: 'Included',
      parking_slot: 'P-B102',
      availability_status: 'Reserved',
      facing: 'East',
      description: 'Family 3 BHK with utility room and private terrace deck.',
      amenity_ids: ['amn_clubhouse', 'amn_pool', 'amn_gym', 'amn_security', 'amn_parking'],
    },
    {
      id: 'unt_skh_b_201',
      project_id: 'proj_skyline_heights',
      wing_id: 'wng_skh_b',
      unit_number: 'B-201',
      floor: 2,
      configuration: '4 BHK',
      carpet_area: 2100,
      built_up_area: 2750,
      price: 22500000,
      parking_type: 'Included',
      parking_slot: 'P-B201-Dual',
      availability_status: 'Available',
      facing: 'North-East',
      description: 'Grand 4 BHK luxury flat with dual parking, servant quarter, and private foyer.',
      amenity_ids: ['amn_clubhouse', 'amn_pool', 'amn_gym', 'amn_security', 'amn_backup', 'amn_parking', 'amn_ev'],
    },

    // --- Skyline Heights: Wing C (Penthouses) ---
    {
      id: 'unt_skh_c_1001',
      project_id: 'proj_skyline_heights',
      wing_id: 'wng_skh_c',
      unit_number: 'C-1001',
      floor: 10,
      configuration: 'Penthouse',
      carpet_area: 3200,
      built_up_area: 4200,
      price: 38500000,
      parking_type: 'Included',
      parking_slot: 'P-C1001-Tri',
      availability_status: 'Available',
      facing: '360 Panoramic View',
      description: 'Top-floor duplex Penthouse with private plunge pool and landscaped roof garden.',
      amenity_ids: ['amn_clubhouse', 'amn_pool', 'amn_gym', 'amn_security', 'amn_backup', 'amn_parking', 'amn_jogging'],
    },

    // --- Skyline Bayview: Tower 1 (Mumbai) ---
    {
      id: 'unt_skb_t1_501',
      project_id: 'proj_skyline_bayview',
      wing_id: 'wng_skb_t1',
      unit_number: 'T1-501',
      floor: 5,
      configuration: '3 BHK',
      carpet_area: 1650,
      built_up_area: 2200,
      price: 45000000,
      parking_type: 'Included',
      parking_slot: 'SB-501',
      availability_status: 'Available',
      facing: 'Arabian Sea View',
      description: 'Opulent sea-facing residence with floor-to-ceiling soundproof acoustic glass.',
      amenity_ids: ['amn_clubhouse', 'amn_pool', 'amn_gym', 'amn_security', 'amn_backup', 'amn_parking'],
    },
    {
      id: 'unt_skb_t1_502',
      project_id: 'proj_skyline_bayview',
      wing_id: 'wng_skb_t1',
      unit_number: 'T1-502',
      floor: 5,
      configuration: '4 BHK',
      carpet_area: 2400,
      built_up_area: 3100,
      price: 68000000,
      parking_type: 'Included',
      parking_slot: 'SB-502-Dual',
      availability_status: 'Reserved',
      facing: 'Arabian Sea & Queens Necklace View',
      description: 'Ultra-exclusive Marine Drive 4 BHK with private elevator vestibule.',
      amenity_ids: ['amn_clubhouse', 'amn_pool', 'amn_gym', 'amn_security', 'amn_backup', 'amn_parking', 'amn_ev'],
    },

    // --- Skyline Grandeur: Wing Alpha (Bangalore) ---
    {
      id: 'unt_skg_a_101',
      project_id: 'proj_skyline_grandeur',
      wing_id: 'wng_skg_alpha',
      unit_number: 'Alpha-101',
      floor: 1,
      configuration: '2 BHK',
      carpet_area: 1050,
      built_up_area: 1350,
      price: 9800000,
      parking_type: 'Included',
      parking_slot: 'SG-A101',
      availability_status: 'Available',
      facing: 'East (Central Park)',
      description: 'Smart home enabled 2 BHK apartment with voice-automated climate control.',
      amenity_ids: ['amn_clubhouse', 'amn_pool', 'amn_gym', 'amn_security', 'amn_backup', 'amn_parking', 'amn_ev'],
    },
    {
      id: 'unt_skg_a_102',
      project_id: 'proj_skyline_grandeur',
      wing_id: 'wng_skg_alpha',
      unit_number: 'Alpha-102',
      floor: 1,
      configuration: '3 BHK',
      carpet_area: 1550,
      built_up_area: 1980,
      price: 14500000,
      parking_type: 'Included',
      parking_slot: 'SG-A102',
      availability_status: 'Sold',
      facing: 'North-East',
      description: 'Premium tech corridor 3 BHK with dedicated study and high-speed fiber provision.',
      amenity_ids: ['amn_clubhouse', 'amn_pool', 'amn_gym', 'amn_security', 'amn_backup', 'amn_parking'],
    },
  ];

  for (const u of unitsData) {
    const existing = await db.get('SELECT id FROM property_units WHERE id = ?', [u.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO property_units (id, project_id, wing_id, unit_number, floor, configuration, carpet_area, built_up_area, price, parking_type, parking_slot, availability_status, facing, description, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'usr_admin_001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          u.id,
          u.project_id,
          u.wing_id,
          u.unit_number,
          u.floor,
          u.configuration,
          u.carpet_area,
          u.built_up_area,
          u.price,
          u.parking_type,
          u.parking_slot,
          u.availability_status,
          u.facing,
          u.description,
        ]
      );

      // Link Amenities
      for (const amnId of u.amenity_ids) {
        await db.run(
          `INSERT OR IGNORE INTO property_unit_amenities (id, unit_id, amenity_id, created_at)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [`pua_${crypto.randomUUID()}`, u.id, amnId]
        );
      }

      // Log Unit Creation Activity
      await db.run(
        `INSERT INTO property_activities (id, resource_type, resource_id, activity_type, title, description, performed_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          `pact_${crypto.randomUUID()}`,
          'UNIT',
          u.id,
          'UNIT_CREATED',
          `Unit ${u.unit_number} Registered`,
          `Recorded ${u.configuration} inventory specification with status ${u.availability_status}.`,
          'usr_admin_001',
        ]
      );

      console.log(`[Seed] Created unit: ${u.unit_number} [${u.configuration} - ${u.availability_status}]`);
    }
  }

  // Update Project total_units counters based on actual units in database
  const projectCounts = await db.all<{ project_id: string; cnt: number }>(
    `SELECT project_id, COUNT(*) as cnt FROM property_units GROUP BY project_id`
  );
  for (const pc of projectCounts) {
    await db.run(
      `UPDATE property_projects SET total_units = ? WHERE id = ?`,
      [pc.cnt, pc.project_id]
    );
  }

  // Link seed leads & enquiries to seeded projects & units for backward compatibility demo
  await db.run(
    `UPDATE enquiries SET project_id = 'proj_skyline_heights', unit_id = 'unt_skh_a_101' WHERE interested_property LIKE '%Skyline Heights%'`
  );
  await db.run(
    `UPDATE enquiries SET project_id = 'proj_skyline_bayview', unit_id = 'unt_skb_t1_501' WHERE interested_property LIKE '%Skyline Bayview%'`
  );
  await db.run(
    `UPDATE leads SET project_id = 'proj_skyline_heights', unit_id = 'unt_skh_a_102' WHERE interested_property LIKE '%Skyline Heights%'`
  );
  await db.run(
    `UPDATE leads SET project_id = 'proj_skyline_bayview', unit_id = 'unt_skb_t1_502' WHERE interested_property LIKE '%Skyline Bayview%'`
  );

  console.log('[Seed] Database seed completed successfully!');
}

// Direct execution
if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}
