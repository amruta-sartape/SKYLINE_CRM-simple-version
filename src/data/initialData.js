/**
 * Skyline CRM - Realistic Minimal Sample Data (3-5 records per category)
 */

export const initialUsers = [
  {
    id: "usr-01",
    firstName: "Alexander",
    lastName: "Wright",
    email: "admin@skylinecrm.com",
    username: "admin",
    password: "password123",
    role: "Admin",
    phone: "+1 (555) 234-5678",
    department: "Executive Management",
    status: "Active",
    createdAt: "2025-01-10"
  }
];

// 1. CLIENT ENQUIRIES (with exact fields: Customer Name, Mobile Number, Email, City, Budget, Interested Property, Configuration: 1/2/3/4 BHK, Lead Source, Sales Executive, Enquiry Date, Status: New Lead)
export const initialEnquiries = [
  {
    id: "ENQ-1001",
    customerName: "Jonathan Miller",
    mobileNumber: "+1 (555) 891-2345",
    email: "j.miller@gmail.com",
    city: "New York",
    budget: "$450,000 - $550,000",
    interestedProperty: "Skyline Tower A",
    configuration: "3 BHK",
    leadSource: "Website",
    salesExecutive: "Sarah Jenkins",
    enquiryDate: "2025-05-12",
    status: "New Lead",
    notes: "Interested in higher floors with sunrise views. Needs 2 parking spots."
  },
  {
    id: "ENQ-1002",
    customerName: "Dr. Aris Thorne",
    mobileNumber: "+1 (555) 782-9012",
    email: "athorne.med@outlook.com",
    city: "Boston",
    budget: "$320,000 - $380,000",
    interestedProperty: "Skyline Heights",
    configuration: "2 BHK",
    leadSource: "Google Ads",
    salesExecutive: "Marcus Vance",
    enquiryDate: "2025-05-14",
    status: "New Lead",
    notes: "Looking for ready-to-move apartment with clubhouse access."
  },
  {
    id: "ENQ-1003",
    customerName: "Claire Dupont",
    mobileNumber: "+1 (555) 673-4567",
    email: "claire.dupont@techcorp.io",
    city: "San Francisco",
    budget: "$850,000 - $1,100,000",
    interestedProperty: "Skyline Grandeur",
    configuration: "4 BHK",
    leadSource: "Facebook / Instagram",
    salesExecutive: "Sarah Jenkins",
    enquiryDate: "2025-05-15",
    status: "New Lead",
    notes: "Corporate executive seeking penthouse with private terrace."
  },
  {
    id: "ENQ-1004",
    customerName: "Robert & Linda Hayes",
    mobileNumber: "+1 (555) 564-7890",
    email: "hayes_family@yahoo.com",
    city: "Chicago",
    budget: "$520,000 - $600,000",
    interestedProperty: "Skyline Green Park",
    configuration: "3 BHK",
    leadSource: "Referral",
    salesExecutive: "Marcus Vance",
    enquiryDate: "2025-05-18",
    status: "New Lead",
    notes: "Looking for garden-facing ground floor unit."
  },
  {
    id: "ENQ-1005",
    customerName: "Benjamin Patel",
    mobileNumber: "+1 (555) 432-8765",
    email: "b.patel@horizon.net",
    city: "Austin",
    budget: "$280,000 - $320,000",
    interestedProperty: "Skyline Tower A",
    configuration: "1 BHK",
    leadSource: "Property Portal",
    salesExecutive: "David Chen",
    enquiryDate: "2025-05-19",
    status: "New Lead",
    notes: "First-time home buyer, interested in flexible down-payment plans."
  }
];

// 2. LEAD QUALIFICATION (Lead Track)
// Fields: Customer, Budget, Loan Required?, Preferred Location, Flat Type, Purchase Timeline, Self Use / Investment, Sales Executive, Lead Status (Qualified, Not Interested, Future Prospect, Wrong Number, Duplicate)
export const initialLeadTrack = [
  {
    id: "LT-201",
    customer: "Jonathan Miller",
    budget: "$500,000",
    loanRequired: "Yes (Bank Loan)",
    preferredLocation: "Skyline Tower A (East Wing)",
    flatType: "3 BHK",
    purchaseTimeline: "Within 30 Days",
    purpose: "Self Use",
    salesExecutive: "Sarah Jenkins",
    leadStatus: "Qualified",
    lastContact: "2025-05-18",
    notes: "Pre-approved loan sanction ready from HDFC Bank."
  },
  {
    id: "LT-202",
    customer: "Dr. Aris Thorne",
    budget: "$350,000",
    loanRequired: "No (Self Funded)",
    preferredLocation: "Skyline Heights (Floor 8)",
    flatType: "2 BHK",
    purchaseTimeline: "Immediate",
    purpose: "Self Use",
    salesExecutive: "Marcus Vance",
    leadStatus: "Qualified",
    lastContact: "2025-05-19",
    notes: "Site visit completed; ready to sign token booking."
  },
  {
    id: "LT-203",
    customer: "Claire Dupont",
    budget: "$950,000",
    loanRequired: "Yes (Corporate Loan)",
    preferredLocation: "Skyline Grandeur (Top Floor)",
    flatType: "4 BHK",
    purchaseTimeline: "Within 60 Days",
    purpose: "Investment",
    salesExecutive: "Sarah Jenkins",
    leadStatus: "Future Prospect",
    lastContact: "2025-05-16",
    notes: "Awaiting board approval for executive relocation budget."
  },
  {
    id: "LT-204",
    customer: "Victor Sanchez",
    budget: "$250,000",
    loanRequired: "Yes",
    preferredLocation: "Skyline Heights",
    flatType: "1 BHK",
    purchaseTimeline: "6+ Months",
    purpose: "Investment",
    salesExecutive: "David Chen",
    leadStatus: "Not Interested",
    lastContact: "2025-05-10",
    notes: "Found budget mismatch with current release pricing."
  },
  {
    id: "LT-205",
    customer: "Anonymous Caller",
    budget: "-",
    loanRequired: "-",
    preferredLocation: "-",
    flatType: "2 BHK",
    purchaseTimeline: "-",
    purpose: "-",
    salesExecutive: "David Chen",
    leadStatus: "Wrong Number",
    lastContact: "2025-05-08",
    notes: "Number belonged to a retail agency, not the prospect."
  }
];

// 3. FOLLOW-UP MANAGEMENT (Follow-up Track)
// Fields: Customer, Date, Time, Remarks, Next Follow-up Date, Executive Name, Follow-up Type: Phone Call, WhatsApp, Email, SMS, Meeting, Video Call
export const initialFollowups = [
  {
    id: "FLP-301",
    customer: "Jonathan Miller",
    date: "2025-05-20",
    time: "10:30 AM",
    remarks: "Discussed Tower A East Wing layout. Shared updated brochure on WhatsApp.",
    nextFollowupDate: "2025-05-24",
    executiveName: "Sarah Jenkins",
    followupType: "Phone Call",
    status: "Pending"
  },
  {
    id: "FLP-302",
    customer: "Dr. Aris Thorne",
    date: "2025-05-21",
    time: "02:00 PM",
    remarks: "In-person meeting at sales lounge. Finalized Unit 804 specifications.",
    nextFollowupDate: "2025-05-25",
    executiveName: "Marcus Vance",
    followupType: "Meeting",
    status: "Completed"
  },
  {
    id: "FLP-303",
    customer: "Claire Dupont",
    date: "2025-05-22",
    time: "04:30 PM",
    remarks: "Virtual architectural walkthrough of Grandeur Penthouse Suite.",
    nextFollowupDate: "2025-05-27",
    executiveName: "Sarah Jenkins",
    followupType: "Video Call",
    status: "Pending"
  },
  {
    id: "FLP-304",
    customer: "Robert & Linda Hayes",
    date: "2025-05-23",
    time: "11:00 AM",
    remarks: "Sent formal quotation and stamp duty breakup via email.",
    nextFollowupDate: "2025-05-28",
    executiveName: "Marcus Vance",
    followupType: "Email",
    status: "Scheduled"
  },
  {
    id: "FLP-305",
    customer: "Benjamin Patel",
    date: "2025-05-24",
    time: "03:15 PM",
    remarks: "Sent construction milestone photo updates and payment schedule.",
    nextFollowupDate: "2025-05-29",
    executiveName: "David Chen",
    followupType: "WhatsApp",
    status: "Scheduled"
  }
];

// 4. PROPERTY SELECTION
// Configurations: 1 BHK, 2 BHK, 3 BHK, 4 BHK
// Fields: Unit Number, Floor, Wing, Carpet Area, Built-up Area, Price, Parking, Amenities, Availability (Available, Sold)
export const initialProperties = [
  {
    id: "PROP-101",
    unitNumber: "Unit 402",
    floor: "4th Floor",
    wing: "Wing A (Sunrise)",
    configuration: "2 BHK",
    carpetArea: "820 sq ft",
    builtUpArea: "1,050 sq ft",
    price: 340000,
    parking: "1 Covered Spot",
    amenities: "Clubhouse, Infinity Pool, Gym",
    availability: "Available"
  },
  {
    id: "PROP-102",
    unitNumber: "Unit 804",
    floor: "8th Floor",
    wing: "Wing B (Parkview)",
    configuration: "2 BHK",
    carpetArea: "860 sq ft",
    builtUpArea: "1,120 sq ft",
    price: 350000,
    parking: "1 Covered Spot",
    amenities: "Central Park View, Jogging Track",
    availability: "Sold"
  },
  {
    id: "PROP-103",
    unitNumber: "Unit 1201",
    floor: "12th Floor",
    wing: "Wing A (Sunrise)",
    configuration: "3 BHK",
    carpetArea: "1,280 sq ft",
    builtUpArea: "1,650 sq ft",
    price: 580000,
    parking: "2 Covered Spots",
    amenities: "Sky Lounge, Private Elevator, Concierge",
    availability: "Sold"
  },
  {
    id: "PROP-104",
    unitNumber: "Unit 1402",
    floor: "14th Floor",
    wing: "Wing C (Skyline Highs)",
    configuration: "3 BHK",
    carpetArea: "1,350 sq ft",
    builtUpArea: "1,720 sq ft",
    price: 610000,
    parking: "2 Covered Spots",
    amenities: "Panoramic Sea View, Smart Home Tech",
    availability: "Available"
  },
  {
    id: "PROP-105",
    unitNumber: "Penthouse P-04",
    floor: "18th Floor (Top)",
    wing: "Grandeur Signature",
    configuration: "4 BHK",
    carpetArea: "2,450 sq ft",
    builtUpArea: "3,100 sq ft",
    price: 1100000,
    parking: "3 Dedicated Bays",
    amenities: "Private Terrace Pool, Helipad Access",
    availability: "Available"
  },
  {
    id: "PROP-106",
    unitNumber: "Unit 205",
    floor: "2nd Floor",
    wing: "Wing B (Parkview)",
    configuration: "1 BHK",
    carpetArea: "520 sq ft",
    builtUpArea: "680 sq ft",
    price: 210000,
    parking: "1 Open Spot",
    amenities: "Community Hall, Kids Play Arena",
    availability: "Available"
  }
];

// 5. SITE VISIT TRACK
// Fields: Customer, Visit Date, Visit Time, Pickup Required (Yes/No), Executive, Customer Feedback, Status (Visited, Rescheduled, No Show)
export const initialSiteVisits = [
  {
    id: "SVT-501",
    customer: "Claire Dupont",
    propertyInterested: "Skyline Grandeur",
    unitNumber: "Penthouse P-04",
    visitDate: "2025-05-22",
    visitTime: "10:00 AM",
    pickupRequired: "Yes (VIP Pickup)",
    executive: "Sarah Jenkins",
    customerFeedback: "Extremely impressed by terrace view; questioned maintenance fee structure.",
    status: "Visited"
  },
  {
    id: "SVT-502",
    customer: "Dr. Aris Thorne",
    propertyInterested: "Skyline Heights",
    unitNumber: "Unit 804",
    visitDate: "2025-05-17",
    visitTime: "03:00 PM",
    pickupRequired: "No (Self Drive)",
    executive: "Marcus Vance",
    customerFeedback: "Liked natural light and Italian marble flooring. Proceeded to booking.",
    status: "Visited"
  },
  {
    id: "SVT-503",
    customer: "Robert Hayes",
    propertyInterested: "Skyline Green Park",
    unitNumber: "Villa G-12",
    visitDate: "2025-05-26",
    visitTime: "11:30 AM",
    pickupRequired: "Yes (Standard Cab)",
    executive: "Marcus Vance",
    customerFeedback: "Client requested shift of appointment due to medical emergency.",
    status: "Rescheduled"
  },
  {
    id: "SVT-504",
    customer: "Victor Sanchez",
    propertyInterested: "Skyline Tower A",
    unitNumber: "Unit 205",
    visitDate: "2025-05-15",
    visitTime: "04:00 PM",
    pickupRequired: "No",
    executive: "David Chen",
    customerFeedback: "Customer did not answer phone or arrive at site pavilion.",
    status: "No Show"
  }
];

// 6. NEGOTIATION
// Fields: Customer, Unit Number, Offered Price, Discount, Special Offer, Management Approval (Approved, Pending Approval, Under Review, Rejected)
export const initialNegotiations = [
  {
    id: "NEG-601",
    customer: "Jonathan Miller",
    unitNumber: "Unit 1402",
    basePrice: 610000,
    offeredPrice: 585000,
    discount: "$25,000 (4.1%)",
    specialOffer: "Free 1st Year Club Membership + Modular Kitchen",
    managementApproval: "Approved",
    handledBy: "Sarah Jenkins",
    date: "2025-05-19",
    status: "Deal Closed"
  },
  {
    id: "NEG-602",
    customer: "Claire Dupont",
    unitNumber: "Penthouse P-04",
    basePrice: 1100000,
    offeredPrice: 1020000,
    discount: "$80,000 (7.2%)",
    specialOffer: "Customized Wooden Flooring + 2 Free EV Chargers",
    managementApproval: "Under Review",
    handledBy: "Sarah Jenkins",
    date: "2025-05-20",
    status: "Negotiating"
  },
  {
    id: "NEG-603",
    customer: "Benjamin Patel",
    unitNumber: "Unit 205",
    basePrice: 210000,
    offeredPrice: 195000,
    discount: "$15,000 (7.1%)",
    specialOffer: "Zero Stamp Duty Registration Fest Offer",
    managementApproval: "Pending Approval",
    handledBy: "David Chen",
    date: "2025-05-21",
    status: "Awaiting Approval"
  },
  {
    id: "NEG-604",
    customer: "Gregory Cole",
    unitNumber: "Unit 402",
    basePrice: 340000,
    offeredPrice: 290000,
    discount: "$50,000 (14.7%)",
    specialOffer: "Exceeds maximum allowable discount margin.",
    managementApproval: "Rejected",
    handledBy: "Marcus Vance",
    date: "2025-05-16",
    status: "Counter Offer Sent"
  }
];

// 7. BOOKING & BOOKING TRACK
// Fields: Customer, Booking Amount, Booking Date, Unit Number, Floor, Flat Type, Booking Status (Confirmed, Pending, Cancelled)
export const initialBookings = [
  {
    id: "BKG-701",
    bookingNo: "SKY-BK-2025-089",
    customer: "Dr. Aris Thorne",
    bookingAmount: 35000,
    totalCost: 350000,
    bookingDate: "2025-05-18",
    unitNumber: "Unit 804",
    floor: "8th Floor",
    flatType: "2 BHK",
    projectName: "Skyline Heights",
    bookingStatus: "Confirmed",
    salesExecutive: "Marcus Vance"
  },
  {
    id: "BKG-702",
    bookingNo: "SKY-BK-2025-090",
    customer: "Victoria Sterling",
    bookingAmount: 58000,
    totalCost: 580000,
    bookingDate: "2025-05-10",
    unitNumber: "Unit 1201",
    floor: "12th Floor",
    flatType: "3 BHK",
    projectName: "Skyline Grandeur",
    bookingStatus: "Confirmed",
    salesExecutive: "Sarah Jenkins"
  },
  {
    id: "BKG-703",
    bookingNo: "SKY-BK-2025-091",
    customer: "Harrison Palmer",
    bookingAmount: 20000,
    totalCost: 310000,
    bookingDate: "2025-05-19",
    unitNumber: "Unit 602",
    floor: "6th Floor",
    flatType: "2 BHK",
    projectName: "Skyline Tower A",
    bookingStatus: "Pending",
    salesExecutive: "Marcus Vance"
  },
  {
    id: "BKG-704",
    bookingNo: "SKY-BK-2025-078",
    customer: "Franklin Vance",
    bookingAmount: 15000,
    totalCost: 280000,
    bookingDate: "2025-04-25",
    unitNumber: "Unit 301",
    floor: "3rd Floor",
    flatType: "1 BHK",
    projectName: "Skyline Tower A",
    bookingStatus: "Cancelled",
    salesExecutive: "David Chen"
  }
];

// 8. FLAT SALE TRACK
// Fields: Customer, Unit Number, Flat Type, Floor, Sale Amount, Booking Date, Sales Executive, Sale Status
export const initialFlatSales = [
  {
    id: "SLS-801",
    invoiceNo: "INV-SKY-2025-042",
    customer: "Victoria Sterling",
    unitNumber: "Unit 1201",
    flatType: "3 BHK",
    floor: "12th Floor",
    projectName: "Skyline Grandeur",
    saleAmount: 580000,
    receivedAmount: 580000,
    balanceDue: 0,
    bookingDate: "2025-05-10",
    salesExecutive: "Sarah Jenkins",
    saleStatus: "Completed"
  },
  {
    id: "SLS-802",
    invoiceNo: "INV-SKY-2025-043",
    customer: "Michael & Nora Chang",
    unitNumber: "Villa G-08",
    flatType: "3 BHK Villa",
    floor: "Ground + 1",
    projectName: "Skyline Green Park",
    saleAmount: 620000,
    receivedAmount: 450000,
    balanceDue: 170000,
    bookingDate: "2025-04-28",
    salesExecutive: "Marcus Vance",
    saleStatus: "In Process"
  },
  {
    id: "SLS-803",
    invoiceNo: "INV-SKY-2025-044",
    customer: "Gregory & Susan Cole",
    unitNumber: "Unit 405",
    flatType: "2 BHK",
    floor: "4th Floor",
    projectName: "Skyline Heights",
    saleAmount: 340000,
    receivedAmount: 200000,
    balanceDue: 140000,
    bookingDate: "2025-05-02",
    salesExecutive: "Sarah Jenkins",
    saleStatus: "In Process"
  }
];

// 9. CLIENT PAYMENT & DISPLAY CLIENT PAYMENT
// Fields: Customer, Unit Number, Total Cost, Paid Amount, Pending Amount, Due Date, Payment Status (Cleared, Due, Overdue)
// Installment types: Booking Amount, Agreement Payment, Slab Payment, Final Payment
export const initialClientPayments = [
  {
    id: "CPY-901",
    receiptNo: "REC-2025-331",
    customer: "Victoria Sterling",
    unitNumber: "Unit 1201",
    totalCost: 580000,
    installmentType: "Final Payment",
    paidAmount: 290000,
    pendingAmount: 0,
    dueDate: "2025-05-10",
    paymentDate: "2025-05-10",
    paymentMode: "RTGS Transfer (Ref: RTGS9812739102)",
    paymentStatus: "Cleared"
  },
  {
    id: "CPY-902",
    receiptNo: "REC-2025-332",
    customer: "Michael & Nora Chang",
    unitNumber: "Villa G-08",
    totalCost: 620000,
    installmentType: "Slab Payment",
    paidAmount: 150000,
    pendingAmount: 170000,
    dueDate: "2025-06-15",
    paymentDate: "2025-05-12",
    paymentMode: "Demand Draft (DD-445892)",
    paymentStatus: "Cleared"
  },
  {
    id: "CPY-903",
    receiptNo: "REC-2025-333",
    customer: "Gregory Cole",
    unitNumber: "Unit 405",
    totalCost: 340000,
    installmentType: "Agreement Payment",
    paidAmount: 100000,
    pendingAmount: 140000,
    dueDate: "2025-05-30",
    paymentDate: "2025-05-14",
    paymentMode: "Bank NEFT (TXN77812903)",
    paymentStatus: "Cleared"
  },
  {
    id: "CPY-904",
    receiptNo: "REC-2025-334",
    customer: "Dr. Aris Thorne",
    unitNumber: "Unit 804",
    totalCost: 350000,
    installmentType: "Booking Amount",
    paidAmount: 35000,
    pendingAmount: 315000,
    dueDate: "2025-06-10",
    paymentDate: "2025-05-18",
    paymentMode: "Wire Transfer (WIRE-1102)",
    paymentStatus: "Due"
  }
];

// 10. DOCUMENT COLLECTION
// Documents: PAN Card, Aadhaar Card, Passport Photo, Address Proof, Income Proof, Bank Statement
export const initialDocumentCollections = [
  {
    id: "DOC-1001",
    customer: "Victoria Sterling",
    unitNumber: "Unit 1201",
    panCard: "Verified",
    aadhaarCard: "Verified",
    passportPhoto: "Verified",
    addressProof: "Verified",
    incomeProof: "Verified",
    bankStatement: "Verified",
    overallStatus: "Complete (100%)",
    updatedDate: "2025-05-11"
  },
  {
    id: "DOC-1002",
    customer: "Dr. Aris Thorne",
    unitNumber: "Unit 804",
    panCard: "Verified",
    aadhaarCard: "Verified",
    passportPhoto: "Uploaded",
    addressProof: "Verified",
    incomeProof: "Pending Verification",
    bankStatement: "Verified",
    overallStatus: "Pending (80%)",
    updatedDate: "2025-05-19"
  },
  {
    id: "DOC-1003",
    customer: "Michael Chang",
    unitNumber: "Villa G-08",
    panCard: "Verified",
    aadhaarCard: "Verified",
    passportPhoto: "Verified",
    addressProof: "Verified",
    incomeProof: "Verified",
    bankStatement: "Pending",
    overallStatus: "Pending (85%)",
    updatedDate: "2025-05-15"
  },
  {
    id: "DOC-1004",
    customer: "Harrison Palmer",
    unitNumber: "Unit 602",
    panCard: "Uploaded",
    aadhaarCard: "Uploaded",
    passportPhoto: "Pending",
    addressProof: "Rejected (Blurry)",
    incomeProof: "Pending",
    bankStatement: "Pending",
    overallStatus: "Action Required (30%)",
    updatedDate: "2025-05-19"
  }
];

// 11. LOAN PROCESSING
// Status: Loan Applied, Bank Verification, Approved, Rejected, Disbursed
// Bank Details: Bank Name, Loan Amount, EMI, Sanction Date
export const initialLoanProcessings = [
  {
    id: "LN-1101",
    customer: "Dr. Aris Thorne",
    unitNumber: "Unit 804",
    bankName: "HDFC Bank Home Loans",
    loanAmount: 280000,
    interestRate: "8.40%",
    tenureYears: 20,
    emi: 2412,
    sanctionDate: "2025-05-15",
    status: "Approved",
    executive: "Marcus Vance"
  },
  {
    id: "LN-1102",
    customer: "Michael & Nora Chang",
    unitNumber: "Villa G-08",
    bankName: "State Bank Mortgage",
    loanAmount: 450000,
    interestRate: "8.55%",
    tenureYears: 25,
    emi: 3640,
    sanctionDate: "2025-05-02",
    status: "Disbursed",
    executive: "Marcus Vance"
  },
  {
    id: "LN-1103",
    customer: "Jonathan Miller",
    unitNumber: "Unit 1402",
    bankName: "Chase Home Finance",
    loanAmount: 400000,
    interestRate: "8.25%",
    tenureYears: 20,
    emi: 3408,
    sanctionDate: "Awaiting Audit",
    status: "Bank Verification",
    executive: "Sarah Jenkins"
  },
  {
    id: "LN-1104",
    customer: "Benjamin Patel",
    unitNumber: "Unit 205",
    bankName: "Axis Bank Home Loan",
    loanAmount: 180000,
    interestRate: "8.75%",
    tenureYears: 15,
    emi: 1798,
    sanctionDate: "Pending",
    status: "Loan Applied",
    executive: "David Chen"
  }
];

// 12. AGREEMENT
// Fields: Customer, Unit Number, Agreement Date, Stamp Duty, Registration Date, Registration Number, Status
export const initialAgreements = [
  {
    id: "AGR-1201",
    customer: "Victoria Sterling",
    unitNumber: "Unit 1201 (Skyline Grandeur)",
    agreementDate: "2025-05-12",
    stampDuty: "$34,800 (6%)",
    registrationDate: "2025-05-15",
    registrationNumber: "REG-NY-2025-99812",
    subRegistrarOffice: "District Central Sub-Registrar",
    status: "Signed & Stamped"
  },
  {
    id: "AGR-1202",
    customer: "Dr. Aris Thorne",
    unitNumber: "Unit 804 (Skyline Heights)",
    agreementDate: "2025-05-20",
    stampDuty: "$21,000 (6%)",
    registrationDate: "2025-05-28",
    registrationNumber: "Pending Registration",
    subRegistrarOffice: "East Zone Sub-Registrar",
    status: "Draft Generated"
  },
  {
    id: "AGR-1203",
    customer: "Michael & Nora Chang",
    unitNumber: "Villa G-08 (Skyline Green)",
    agreementDate: "2025-05-05",
    stampDuty: "$37,200 (6%)",
    registrationDate: "2025-05-10",
    registrationNumber: "REG-GR-2025-44219",
    subRegistrarOffice: "Suburban Land Registry",
    status: "Signed & Stamped"
  },
  {
    id: "AGR-1204",
    customer: "Gregory Cole",
    unitNumber: "Unit 405 (Skyline Heights)",
    agreementDate: "2025-05-18",
    stampDuty: "$20,400 (6%)",
    registrationDate: "2025-06-02",
    registrationNumber: "In Queue",
    subRegistrarOffice: "East Zone Sub-Registrar",
    status: "In Sub-Registrar Office"
  }
];

// 13. POSSESSION
// Checklist: Final Inspection, Utility Connection, Key Handover, Possession Letter. Status: Ready, Delivered
export const initialPossessions = [
  {
    id: "POS-1301",
    customer: "Victoria Sterling",
    unitNumber: "Unit 1201",
    projectName: "Skyline Grandeur",
    handoverDate: "2025-06-30",
    finalInspection: "Completed (Passed)",
    utilityConnection: "Electricity & Water Meter Active",
    keyHandover: "Delivered (3 Sets + Smart Tag)",
    possessionLetter: "Signed & Handed Over",
    status: "Delivered"
  },
  {
    id: "POS-1302",
    customer: "Michael Chang",
    unitNumber: "Villa G-08",
    projectName: "Skyline Green Park",
    handoverDate: "2025-08-15",
    finalInspection: "Completed (Minor Snags Fixed)",
    utilityConnection: "Meters Installed",
    keyHandover: "Ready at Sales Pavilion",
    possessionLetter: "Draft Generated",
    status: "Ready"
  },
  {
    id: "POS-1303",
    customer: "Gregory Cole",
    unitNumber: "Unit 405",
    projectName: "Skyline Heights",
    handoverDate: "2025-07-20",
    finalInspection: "Scheduled for July 1st",
    utilityConnection: "Under Connection",
    keyHandover: "Pending",
    possessionLetter: "Pending",
    status: "Ready"
  }
];

// 14. CUSTOMER SUPPORT
// After-sales categories: Maintenance, Complaint, Service Request, Documentation, Referral
// Fields: Ticket ID, Customer, Unit Number, Category, Subject, Priority, Assigned Executive, Date, Status
export const initialCustomerSupports = [
  {
    id: "TCK-1401",
    customer: "Victoria Sterling",
    unitNumber: "Unit 1201",
    category: "Service Request",
    subject: "Additional smart home sensor installation in master suite balcony",
    priority: "Medium",
    assignedExecutive: "Devon Miller",
    date: "2025-05-18",
    status: "In Progress"
  },
  {
    id: "TCK-1402",
    customer: "Michael Chang",
    unitNumber: "Villa G-08",
    category: "Documentation",
    subject: "Certified true copies of approved municipal building sanction drawings",
    priority: "Low",
    assignedExecutive: "Elena Rostova",
    date: "2025-05-16",
    status: "Resolved"
  },
  {
    id: "TCK-1403",
    customer: "Dr. Aris Thorne",
    unitNumber: "Unit 804",
    category: "Maintenance",
    subject: "Pre-possession electrical outlet voltage calibration check",
    priority: "High",
    assignedExecutive: "Devon Miller",
    date: "2025-05-19",
    status: "Open"
  },
  {
    id: "TCK-1404",
    customer: "Victoria Sterling",
    unitNumber: "Unit 1201",
    category: "Referral",
    subject: "Colleague interested in purchasing 3 BHK in Tower A Wing",
    priority: "High",
    assignedExecutive: "Sarah Jenkins",
    date: "2025-05-19",
    status: "Open"
  }
];

// ==========================================
// VENDOR & FINANCE MASTER DATA
// ==========================================

// 1. VENDOR MASTER
// Categories: Civil Contractor, Electrical Contractor, Plumbing Contractor, Paint Contractor, Material Supplier, Lift Supplier, Security Agency, Housekeeping, Architect, Interior Designer, Legal Consultant
export const initialVendors = [
  {
    id: "VND-101",
    vendorName: "Apex Infrastructure Works",
    companyName: "Apex Civil & Engineering Solutions Pvt Ltd",
    category: "Civil Contractor",
    gstNumber: "27AAACA1234A1Z5",
    panNumber: "AAACA1234A",
    contactPerson: "Rajesh Sharma",
    mobile: "+1 (555) 321-7890",
    email: "rajesh@apexcivil.com",
    address: "Plot 42, Industrial Development Area, New York",
    bankName: "Chase Bank Corporate",
    accountNo: "987654321012",
    ifsc: "CHAS0001234",
    branch: "Midtown Manhattan",
    status: "Active",
    verificationStatus: "Verified",
    enquiryNotes: "Contractor for RCC Foundation & Superstructure",
    followupDate: "2025-06-01"
  },
  {
    id: "VND-102",
    vendorName: "Titan Steel & Metals",
    companyName: "Titan Steel & Structural Supplies Ltd",
    category: "Material Supplier",
    gstNumber: "27AABCT5544B1Z8",
    panNumber: "AABCT5544B",
    contactPerson: "Vikram Malhotra",
    mobile: "+1 (555) 432-8901",
    email: "v.malhotra@titansteel.com",
    address: "Steel Yard 14, Port Terminal West",
    bankName: "Citibank Commercial",
    accountNo: "887766554433",
    ifsc: "CITI0009876",
    branch: "Queens Hub",
    status: "Active",
    verificationStatus: "Verified",
    enquiryNotes: "TMT Fe 500D steel bar bulk delivery vendor",
    followupDate: "2025-05-30"
  },
  {
    id: "VND-103",
    vendorName: "Apex Elevators & Lifts",
    companyName: "Apex Elevator Technologies International",
    category: "Lift Supplier",
    gstNumber: "27AABCE9988C1Z2",
    panNumber: "AABCE9988C",
    contactPerson: "Jonathan Vance",
    mobile: "+1 (555) 543-9012",
    email: "service@apexlifts.com",
    address: "Tower 3, High-Tech Industrial Park",
    bankName: "Bank of America",
    accountNo: "776655443322",
    ifsc: "BOFA0004567",
    branch: "Financial District",
    status: "Active",
    verificationStatus: "Verified",
    enquiryNotes: "High-speed 16-passenger gearless elevators",
    followupDate: "2025-06-15"
  },
  {
    id: "VND-104",
    vendorName: "Lumina Electricals",
    companyName: "Lumina Grid & Power Contractors",
    category: "Electrical Contractor",
    gstNumber: "27AADCL7766D1Z9",
    panNumber: "AADCL7766D",
    contactPerson: "Suresh Verma",
    mobile: "+1 (555) 654-0123",
    email: "suresh@luminagrid.com",
    address: "Unit 19, Electro Plaza, Brooklyn",
    bankName: "Wells Fargo Bank",
    accountNo: "665544332211",
    ifsc: "WELL0002345",
    branch: "Brooklyn Center",
    status: "Active",
    verificationStatus: "Under Verification",
    enquiryNotes: "Transformer installation and substation wiring",
    followupDate: "2025-06-05"
  },
  {
    id: "VND-105",
    vendorName: "Veritas Legal Associates",
    companyName: "Veritas Real Estate Legal Consultants LLP",
    category: "Legal Consultant",
    gstNumber: "27AAACV3322E1Z4",
    panNumber: "AAACV3322E",
    contactPerson: "Adv. Eleanor Vance",
    mobile: "+1 (555) 765-1234",
    email: "legal@veritasadvisory.org",
    address: "Suite 1100, Lex Chambers, Manhattan",
    bankName: "JPMorgan Chase",
    accountNo: "554433221100",
    ifsc: "JPMC0008910",
    branch: "Wall Street",
    status: "Active",
    verificationStatus: "Verified",
    enquiryNotes: "Title search, RERA filings, and municipal search reports",
    followupDate: "2025-06-20"
  }
];

// 2. PURCHASE ORDERS
export const initialPurchaseOrders = [
  {
    id: "PO-101",
    poNumber: "SKY-PO-2025-041",
    date: "2025-05-10",
    vendorName: "Titan Steel & Metals",
    category: "Material Supplier",
    material: "TMT Steel Bars (Fe 500D) - 16mm & 20mm",
    quantity: "50 Metric Tons",
    rate: 850,
    gst: "$7,650 (18%)",
    totalAmount: 50150,
    deliveryDate: "2025-05-25",
    status: "Approved",
    authorizedBy: "Alexander Wright"
  },
  {
    id: "PO-102",
    poNumber: "SKY-PO-2025-042",
    date: "2025-05-12",
    vendorName: "Apex Elevators & Lifts",
    category: "Lift Supplier",
    material: "High-Speed Passenger Lift System (Tower A)",
    quantity: "2 Units",
    rate: 28000,
    gst: "$10,080 (18%)",
    totalAmount: 66080,
    deliveryDate: "2025-06-30",
    status: "In Process",
    authorizedBy: "Alexander Wright"
  },
  {
    id: "PO-103",
    poNumber: "SKY-PO-2025-043",
    date: "2025-05-15",
    vendorName: "Lumina Electricals",
    category: "Electrical Contractor",
    material: "Heavy Duty Armoured Copper Cables & Switchgears",
    quantity: "1,200 Meters",
    rate: 18,
    gst: "$3,888 (18%)",
    totalAmount: 25488,
    deliveryDate: "2025-05-28",
    status: "Approved",
    authorizedBy: "Elena Rostova"
  },
  {
    id: "PO-104",
    poNumber: "SKY-PO-2025-044",
    date: "2025-05-18",
    vendorName: "Apex Infrastructure Works",
    category: "Civil Contractor",
    material: "Ready Mix Concrete (M30 Grade)",
    quantity: "180 Cubic Meters",
    rate: 95,
    gst: "$3,078 (18%)",
    totalAmount: 20178,
    deliveryDate: "2025-05-22",
    status: "Delivered",
    authorizedBy: "Alexander Wright"
  }
];

// 3. VENDOR BILLS & PAYMENT TRACK
// Status: Pending, Partially Paid, Fully Paid, Overdue
export const initialVendorPayments = [
  {
    id: "VND-701",
    vendorName: "Titan Steel & Metals",
    invoiceNumber: "INV-TS-88491",
    invoiceDate: "2025-05-12",
    billAmount: 50150,
    gst: "$7,650 (18%)",
    dueDate: "2025-06-12",
    paymentDate: "2025-05-15",
    paymentMode: "Bank RTGS",
    utrNumber: "UTR998812345678",
    bank: "Chase Bank Corporate",
    paidAmount: 50150,
    balanceAmount: 0,
    paymentStatus: "Fully Paid"
  },
  {
    id: "VND-702",
    vendorName: "Apex Elevators & Lifts",
    invoiceNumber: "INV-APX-0042",
    invoiceDate: "2025-05-14",
    billAmount: 66080,
    gst: "$10,080 (18%)",
    dueDate: "2025-06-14",
    paymentDate: "2025-05-16",
    paymentMode: "Direct Wire Transfer",
    utrNumber: "UTR776655443322",
    bank: "Bank of America",
    paidAmount: 30000,
    balanceAmount: 36080,
    paymentStatus: "Partially Paid"
  },
  {
    id: "VND-703",
    vendorName: "Lumina Electricals",
    invoiceNumber: "INV-LUM-902",
    invoiceDate: "2025-05-16",
    billAmount: 25488,
    gst: "$3,888 (18%)",
    dueDate: "2025-06-16",
    paymentDate: "Pending",
    paymentMode: "Bank Transfer",
    utrNumber: "Pending Release",
    bank: "Wells Fargo Bank",
    paidAmount: 0,
    balanceAmount: 25488,
    paymentStatus: "Pending"
  },
  {
    id: "VND-704",
    vendorName: "Veritas Legal Associates",
    invoiceNumber: "INV-VRT-319",
    invoiceDate: "2025-04-10",
    billAmount: 14500,
    gst: "$2,610 (18%)",
    dueDate: "2025-05-10",
    paymentDate: "Pending",
    paymentMode: "Corporate Cheque",
    utrNumber: "Pending Approval",
    bank: "JPMorgan Chase",
    paidAmount: 0,
    balanceAmount: 14500,
    paymentStatus: "Overdue"
  }
];

// 4. PETTY CASH MANAGEMENT
// 12 Required Expense Categories:
// Office Expenses, Tea & Snacks, Fuel, Vehicle Maintenance, Courier, Stationery, Electricity, Internet, Marketing, Site Expenses, Labour Payment, Miscellaneous
export const initialPettyCash = [
  {
    id: "PTY-801",
    date: "2025-05-18",
    voucherNumber: "VCHR-PC-2025-054",
    expenseCategory: "Site Expenses",
    description: "Site safety helmets, reflective jackets, and emergency LED flood lights",
    employeeName: "Devon Miller",
    amount: 350,
    paymentMode: "Cash",
    requestedBy: "Devon Miller",
    approvedBy: "Alexander Wright",
    remarks: "Approved for site safety audit compliance",
    status: "Approved"
  },
  {
    id: "PTY-802",
    date: "2025-05-18",
    voucherNumber: "VCHR-PC-2025-055",
    expenseCategory: "Tea & Snacks",
    description: "Hospitality and refreshment catering for VIP client visits",
    employeeName: "Sarah Jenkins",
    amount: 185,
    paymentMode: "Cash",
    requestedBy: "Sarah Jenkins",
    approvedBy: "Alexander Wright",
    remarks: "Sales lounge launch hospitality",
    status: "Approved"
  },
  {
    id: "PTY-803",
    date: "2025-05-19",
    voucherNumber: "VCHR-PC-2025-056",
    expenseCategory: "Courier",
    description: "Speed post express dispatch of registered sale deeds to sub-registrar",
    employeeName: "Marcus Vance",
    amount: 95,
    paymentMode: "Cash",
    requestedBy: "Marcus Vance",
    approvedBy: "Alexander Wright",
    remarks: "Official title deed delivery receipt attached",
    status: "Approved"
  },
  {
    id: "PTY-804",
    date: "2025-05-19",
    voucherNumber: "VCHR-PC-2025-057",
    expenseCategory: "Fuel",
    description: "Client site inspection pickup van diesel refuel",
    employeeName: "Devon Miller",
    amount: 140,
    paymentMode: "Cash",
    requestedBy: "Devon Miller",
    approvedBy: "Elena Rostova",
    remarks: "Fuel station bill #9921 attached",
    status: "Approved"
  },
  {
    id: "PTY-805",
    date: "2025-05-20",
    voucherNumber: "VCHR-PC-2025-058",
    expenseCategory: "Stationery",
    description: "A4 bond paper, toner cartridges, and project presentation folders",
    employeeName: "Elena Rostova",
    amount: 220,
    paymentMode: "Cash",
    requestedBy: "Elena Rostova",
    approvedBy: "Alexander Wright",
    remarks: "Office admin supplies for sales wing",
    status: "Approved"
  }
];

// Petty Cash Summary State
export const initialPettyCashSummary = {
  openingBalance: 15000,
  cashReceived: 8000,
  cashSpent: 990,
  closingBalance: 22010
};

// 5. DAY BOOK
// Exact reference values requested in prompt:
// - Payment Receipt Details — Rs. 800000 /-
// - Employee Receipt Expense — Rs. 200000 /-
// - Vendor Receipt Expense — Rs. 100000 /-
// - Petty Cash Expense — Rs. 500000 /-
// - Total Income — Rs. 450000
export const initialDayBookSummary = {
  paymentReceiptDetails: 800000,
  employeeReceiptExpense: 200000,
  vendorReceiptExpense: 100000,
  pettyCashExpense: 500000,
  totalIncome: 450000
};

export const initialDayBook = [
  {
    id: "DB-101",
    entryNo: "DB-2025-0518-01",
    date: "2025-05-18",
    transactionType: "Payment Receipt",
    particulars: "Client Payment Receipt Details - Victoria Sterling (Unit 1201)",
    category: "Payment Receipt Details",
    amount: 800000,
    mode: "RTGS Bank Transfer",
    referenceNo: "RTGS9812739102",
    handledBy: "Elena Rostova"
  },
  {
    id: "DB-102",
    entryNo: "DB-2025-0518-02",
    date: "2025-05-18",
    transactionType: "Employee Expense",
    particulars: "Employee Receipt Expense - Monthly Executive Payroll Disbursal",
    category: "Employee Receipt Expense",
    amount: 200000,
    mode: "Bank Direct Payroll",
    referenceNo: "PAY-CORP-2025-05",
    handledBy: "Elena Rostova"
  },
  {
    id: "DB-103",
    entryNo: "DB-2025-0518-03",
    date: "2025-05-18",
    transactionType: "Vendor Expense",
    particulars: "Vendor Receipt Expense - Material & Structural Supplies Bill",
    category: "Vendor Receipt Expense",
    amount: 100000,
    mode: "Bank NEFT Transfer",
    referenceNo: "NEFT778899112",
    handledBy: "Alexander Wright"
  },
  {
    id: "DB-104",
    entryNo: "DB-2025-0518-04",
    date: "2025-05-18",
    transactionType: "Petty Cash",
    particulars: "Petty Cash Expense - Site Operations, Fuel, Safety & Hospitality",
    category: "Petty Cash Expense",
    amount: 500000,
    mode: "Cash Withdrawal",
    referenceNo: "CHQ-CASH-4412",
    handledBy: "Devon Miller"
  },
  {
    id: "DB-105",
    entryNo: "DB-2025-0519-01",
    date: "2025-05-19",
    transactionType: "Total Income",
    particulars: "Total Income - Booking Tokens, Car Parking Allotments & Club Dues",
    category: "Total Income",
    amount: 450000,
    mode: "Bank Clearing",
    referenceNo: "CLR-2025-9981",
    handledBy: "Sarah Jenkins"
  }
];

export const initialEmployees = [
  {
    id: "EMP-01",
    code: "SKY-EMP-101",
    fullName: "Sarah Jenkins",
    department: "Sales & Marketing",
    designation: "Senior Relationship Manager",
    phone: "+91 98230 12345",
    email: "sarah.j@skylinecrm.com",
    joinDate: "2024-03-01",
    salaryMonthly: 65000,
    salaryStructure: {
      basicSalary: 35000,
      hra: 18000,
      allowances: 12000
    },
    bankDetails: {
      bankName: "HDFC Bank",
      accountNo: "50100432198765",
      ifsc: "HDFC0001234",
      branch: "Main Business District Branch"
    },
    panNumber: "ABCDE1234F",
    aadhaarNumber: "9876-5432-1098",
    pfDetails: {
      uanNo: "101234567890",
      esicNo: "31000987650001"
    },
    commissionRate: "1.5%",
    status: "Active"
  },
  {
    id: "EMP-02",
    code: "SKY-EMP-102",
    fullName: "Elena Rostova",
    department: "Finance & Accounts",
    designation: "Chief Accounts Officer",
    phone: "+91 98230 23456",
    email: "elena.r@skylinecrm.com",
    joinDate: "2023-11-15",
    salaryMonthly: 75000,
    salaryStructure: {
      basicSalary: 42000,
      hra: 20000,
      allowances: 13000
    },
    bankDetails: {
      bankName: "ICICI Bank",
      accountNo: "001205009876",
      ifsc: "ICIC0000012",
      branch: "Corporate Park Towers"
    },
    panNumber: "BLCPR9923K",
    aadhaarNumber: "8765-4321-2109",
    pfDetails: {
      uanNo: "101234567891",
      esicNo: "31000987650002"
    },
    commissionRate: "0%",
    status: "Active"
  },
  {
    id: "EMP-03",
    code: "SKY-EMP-103",
    fullName: "Devon Miller",
    department: "Civil & Infrastructure",
    designation: "Site Project Coordinator",
    phone: "+91 98230 34567",
    email: "devon.m@skylinecrm.com",
    joinDate: "2024-06-10",
    salaryMonthly: 55000,
    salaryStructure: {
      basicSalary: 30000,
      hra: 15000,
      allowances: 10000
    },
    bankDetails: {
      bankName: "State Bank of India",
      accountNo: "30987654321",
      ifsc: "SBIN0004567",
      branch: "Industrial Zone Branch"
    },
    panNumber: "DFGMK5512L",
    aadhaarNumber: "7654-3210-3210",
    pfDetails: {
      uanNo: "101234567892",
      esicNo: "31000987650003"
    },
    commissionRate: "0.5%",
    status: "Active"
  },
  {
    id: "EMP-04",
    code: "SKY-EMP-104",
    fullName: "Rajesh Sharma",
    department: "Legal & Compliance",
    designation: "Senior Legal Advisor",
    phone: "+91 98230 45678",
    email: "rajesh.s@skylinecrm.com",
    joinDate: "2024-01-20",
    salaryMonthly: 70000,
    salaryStructure: {
      basicSalary: 38000,
      hra: 18000,
      allowances: 14000
    },
    bankDetails: {
      bankName: "Axis Bank",
      accountNo: "918020054321987",
      ifsc: "UTIB0000918",
      branch: "High Street Plaza"
    },
    panNumber: "PQRST8876M",
    aadhaarNumber: "6543-2109-4321",
    pfDetails: {
      uanNo: "101234567893",
      esicNo: "31000987650004"
    },
    commissionRate: "0%",
    status: "Active"
  },
  {
    id: "EMP-05",
    code: "SKY-EMP-105",
    fullName: "Priya Malhotra",
    department: "CRM & Customer Relations",
    designation: "Customer Care Lead",
    phone: "+91 98230 56789",
    email: "priya.m@skylinecrm.com",
    joinDate: "2024-08-01",
    salaryMonthly: 48000,
    salaryStructure: {
      basicSalary: 26000,
      hra: 13000,
      allowances: 9000
    },
    bankDetails: {
      bankName: "Kotak Mahindra Bank",
      accountNo: "7812903456",
      ifsc: "KKBK0001890",
      branch: "Galaxy Mall Branch"
    },
    panNumber: "ZXCVB4432N",
    aadhaarNumber: "5432-1098-5432",
    pfDetails: {
      uanNo: "101234567894",
      esicNo: "31000987650005"
    },
    commissionRate: "0.5%",
    status: "Active"
  }
];

export const initialAttendance = [
  {
    id: "ATT-101",
    employeeId: "EMP-01",
    employeeCode: "SKY-EMP-101",
    employeeName: "Sarah Jenkins",
    department: "Sales & Marketing",
    date: "2026-10-04",
    status: "Present",
    checkIn: "09:15 AM",
    checkOut: "06:30 PM",
    totalHours: "9.25 hrs",
    remarks: "On-time regular morning shift"
  },
  {
    id: "ATT-102",
    employeeId: "EMP-02",
    employeeCode: "SKY-EMP-102",
    employeeName: "Elena Rostova",
    department: "Finance & Accounts",
    date: "2026-10-04",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    totalHours: "9.00 hrs",
    remarks: "Quarterly accounts closing on site"
  },
  {
    id: "ATT-103",
    employeeId: "EMP-03",
    employeeCode: "SKY-EMP-103",
    employeeName: "Devon Miller",
    department: "Civil & Infrastructure",
    date: "2026-10-04",
    status: "Present",
    checkIn: "08:30 AM",
    checkOut: "06:45 PM",
    totalHours: "10.25 hrs",
    remarks: "Tower A site inspection & quality audit"
  },
  {
    id: "ATT-104",
    employeeId: "EMP-04",
    employeeCode: "SKY-EMP-104",
    employeeName: "Rajesh Sharma",
    department: "Legal & Compliance",
    date: "2026-10-04",
    status: "Leave",
    checkIn: "-",
    checkOut: "-",
    totalHours: "0 hrs",
    remarks: "Approved Casual Leave"
  },
  {
    id: "ATT-105",
    employeeId: "EMP-05",
    employeeCode: "SKY-EMP-105",
    employeeName: "Priya Malhotra",
    department: "CRM & Customer Relations",
    date: "2026-10-04",
    status: "Present",
    checkIn: "09:30 AM",
    checkOut: "06:30 PM",
    totalHours: "9.00 hrs",
    remarks: "Client possession calls & handovers"
  }
];

export const initialLeaves = [
  {
    id: "LEV-101",
    employeeId: "EMP-04",
    employeeCode: "SKY-EMP-104",
    employeeName: "Rajesh Sharma",
    department: "Legal & Compliance",
    leaveType: "Casual Leave",
    fromDate: "2026-10-04",
    toDate: "2026-10-05",
    numDays: 2,
    reason: "Family event & outstation travel",
    appliedDate: "2026-10-01",
    status: "Approved",
    approvedBy: "Admin"
  },
  {
    id: "LEV-102",
    employeeId: "EMP-01",
    employeeCode: "SKY-EMP-101",
    employeeName: "Sarah Jenkins",
    department: "Sales & Marketing",
    leaveType: "Sick Leave",
    fromDate: "2026-10-12",
    toDate: "2026-10-13",
    numDays: 2,
    reason: "Medical checkup and viral fever recovery",
    appliedDate: "2026-10-03",
    status: "Pending",
    approvedBy: "-"
  },
  {
    id: "LEV-103",
    employeeId: "EMP-03",
    employeeCode: "SKY-EMP-103",
    employeeName: "Devon Miller",
    department: "Civil & Infrastructure",
    leaveType: "Paid Leave",
    fromDate: "2026-09-15",
    toDate: "2026-09-18",
    numDays: 4,
    reason: "Annual family holiday vacation",
    appliedDate: "2026-09-01",
    status: "Approved",
    approvedBy: "Admin"
  },
  {
    id: "LEV-104",
    employeeId: "EMP-05",
    employeeCode: "SKY-EMP-105",
    employeeName: "Priya Malhotra",
    department: "CRM & Customer Relations",
    leaveType: "Casual Leave",
    fromDate: "2026-10-20",
    toDate: "2026-10-20",
    numDays: 1,
    reason: "Personal banking and documentation work",
    appliedDate: "2026-10-02",
    status: "Pending",
    approvedBy: "-"
  }
];

export const initialOvertime = [
  {
    id: "OT-101",
    employeeId: "EMP-03",
    employeeCode: "SKY-EMP-103",
    employeeName: "Devon Miller",
    department: "Civil & Infrastructure",
    date: "2026-10-02",
    hours: 3.5,
    reason: "Tower B 14th floor slab concrete casting supervision",
    status: "Approved",
    approvedBy: "Project Head"
  },
  {
    id: "OT-102",
    employeeId: "EMP-01",
    employeeCode: "SKY-EMP-101",
    employeeName: "Sarah Jenkins",
    department: "Sales & Marketing",
    date: "2026-10-01",
    hours: 2.0,
    reason: "Weekend mega property expo client closing meetings",
    status: "Approved",
    approvedBy: "Sales Director"
  },
  {
    id: "OT-103",
    employeeId: "EMP-02",
    employeeCode: "SKY-EMP-102",
    employeeName: "Elena Rostova",
    department: "Finance & Accounts",
    date: "2026-09-30",
    hours: 4.0,
    reason: "Half-yearly GST audit reconciliation and vendor TDS filing",
    status: "Approved",
    approvedBy: "Finance Director"
  },
  {
    id: "OT-104",
    employeeId: "EMP-05",
    employeeCode: "SKY-EMP-105",
    employeeName: "Priya Malhotra",
    department: "CRM & Customer Relations",
    date: "2026-10-03",
    hours: 2.5,
    reason: "Navratri festival registry surge customer assistance",
    status: "Pending",
    approvedBy: "-"
  }
];

export const initialHolidays = [
  {
    id: "HOL-101",
    name: "Gandhi Jayanti",
    date: "2026-10-02",
    day: "Friday",
    type: "National Holiday",
    description: "Celebration of Mahatma Gandhi's birth anniversary"
  },
  {
    id: "HOL-102",
    name: "Dussehra (Vijayadashami)",
    date: "2026-10-20",
    day: "Tuesday",
    type: "Gazetted Holiday",
    description: "Traditional festival holiday"
  },
  {
    id: "HOL-103",
    name: "Diwali (Laxmi Pujan)",
    date: "2026-11-08",
    day: "Sunday",
    type: "Gazetted Holiday",
    description: "Festival of Lights grand celebration"
  },
  {
    id: "HOL-104",
    name: "Guru Nanak Jayanti",
    date: "2026-11-24",
    day: "Tuesday",
    type: "Gazetted Holiday",
    description: "Birth anniversary of Guru Nanak Dev Ji"
  },
  {
    id: "HOL-105",
    name: "Christmas Day",
    date: "2026-12-25",
    day: "Friday",
    type: "National Holiday",
    description: "Celebration of Christmas"
  }
];

export const initialSalaryProcessing = [
  {
    id: "SP-101",
    employeeId: "EMP-01",
    employeeCode: "SKY-EMP-101",
    employeeName: "Sarah Jenkins",
    department: "Sales & Marketing",
    designation: "Senior Relationship Manager",
    month: "October 2026",
    basicSalary: 35000,
    hra: 18000,
    incentives: 8000,
    salesCommission: 15000,
    bonus: 5000,
    grossSalary: 81000,
    deductions: {
      pf: 4200,
      esic: 608,
      profTax: 200,
      advanceSalary: 0,
      loanRecovery: 0
    },
    totalDeductions: 5008,
    netSalary: 75992,
    status: "Processed"
  },
  {
    id: "SP-102",
    employeeId: "EMP-02",
    employeeCode: "SKY-EMP-102",
    employeeName: "Elena Rostova",
    department: "Finance & Accounts",
    designation: "Chief Accounts Officer",
    month: "October 2026",
    basicSalary: 42000,
    hra: 20000,
    incentives: 5000,
    salesCommission: 0,
    bonus: 8000,
    grossSalary: 75000,
    deductions: {
      pf: 5040,
      esic: 0,
      profTax: 200,
      advanceSalary: 0,
      loanRecovery: 0
    },
    totalDeductions: 5240,
    netSalary: 69760,
    status: "Processed"
  },
  {
    id: "SP-103",
    employeeId: "EMP-03",
    employeeCode: "SKY-EMP-103",
    employeeName: "Devon Miller",
    department: "Civil & Infrastructure",
    designation: "Site Project Coordinator",
    month: "October 2026",
    basicSalary: 30000,
    hra: 15000,
    incentives: 4000,
    salesCommission: 3000,
    bonus: 3000,
    grossSalary: 55000,
    deductions: {
      pf: 3600,
      esic: 412,
      profTax: 200,
      advanceSalary: 2000,
      loanRecovery: 0
    },
    totalDeductions: 6212,
    netSalary: 48788,
    status: "Processed"
  },
  {
    id: "SP-104",
    employeeId: "EMP-04",
    employeeCode: "SKY-EMP-104",
    employeeName: "Rajesh Sharma",
    department: "Legal & Compliance",
    designation: "Senior Legal Advisor",
    month: "October 2026",
    basicSalary: 38000,
    hra: 18000,
    incentives: 6000,
    salesCommission: 0,
    bonus: 8000,
    grossSalary: 70000,
    deductions: {
      pf: 4560,
      esic: 0,
      profTax: 200,
      advanceSalary: 0,
      loanRecovery: 0
    },
    totalDeductions: 4760,
    netSalary: 65240,
    status: "Processed"
  },
  {
    id: "SP-105",
    employeeId: "EMP-05",
    employeeCode: "SKY-EMP-105",
    employeeName: "Priya Malhotra",
    department: "CRM & Customer Relations",
    designation: "Customer Care Lead",
    month: "October 2026",
    basicSalary: 26000,
    hra: 13000,
    incentives: 3000,
    salesCommission: 2500,
    bonus: 3500,
    grossSalary: 48000,
    deductions: {
      pf: 3120,
      esic: 360,
      profTax: 200,
      advanceSalary: 0,
      loanRecovery: 0
    },
    totalDeductions: 3680,
    netSalary: 44320,
    status: "Draft"
  }
];

export const initialEmployeePayments = [
  {
    id: "PAY-101",
    slipNo: "SLP-2026-10-101",
    salaryMonth: "October 2026",
    employeeName: "Sarah Jenkins",
    employeeCode: "SKY-EMP-101",
    department: "Sales & Marketing",
    designation: "Senior Relationship Manager",
    basicSalary: 35000,
    hra: 18000,
    incentives: 8000,
    salesCommission: 15000,
    bonus: 5000,
    grossSalary: 81000,
    deductions: {
      pf: 4200,
      esic: 608,
      profTax: 200,
      advanceSalary: 0,
      loanRecovery: 0
    },
    totalDeductions: 5008,
    netSalary: 75992,
    paymentDate: "2026-10-03",
    paymentMode: "Bank Transfer",
    paymentStatus: "Paid",
    referenceNo: "HDFC-NEFT-99238411",
    bankName: "HDFC Bank (A/C: ...98765)",
    notes: "Salary & commission disbursed via corporate NEFT batch."
  },
  {
    id: "PAY-102",
    slipNo: "SLP-2026-10-102",
    salaryMonth: "October 2026",
    employeeName: "Elena Rostova",
    employeeCode: "SKY-EMP-102",
    department: "Finance & Accounts",
    designation: "Chief Accounts Officer",
    basicSalary: 42000,
    hra: 20000,
    incentives: 5000,
    salesCommission: 0,
    bonus: 8000,
    grossSalary: 75000,
    deductions: {
      pf: 5040,
      esic: 0,
      profTax: 200,
      advanceSalary: 0,
      loanRecovery: 0
    },
    totalDeductions: 5240,
    netSalary: 69760,
    paymentDate: "2026-10-03",
    paymentMode: "Bank Transfer",
    paymentStatus: "Paid",
    referenceNo: "ICIC-RTGS-88410291",
    bankName: "ICICI Bank (A/C: ...09876)",
    notes: "Executive monthly salary disbursed."
  },
  {
    id: "PAY-103",
    slipNo: "SLP-2026-10-103",
    salaryMonth: "October 2026",
    employeeName: "Devon Miller",
    employeeCode: "SKY-EMP-103",
    department: "Civil & Infrastructure",
    designation: "Site Project Coordinator",
    basicSalary: 30000,
    hra: 15000,
    incentives: 4000,
    salesCommission: 3000,
    bonus: 3000,
    grossSalary: 55000,
    deductions: {
      pf: 3600,
      esic: 412,
      profTax: 200,
      advanceSalary: 2000,
      loanRecovery: 0
    },
    totalDeductions: 6212,
    netSalary: 48788,
    paymentDate: "2026-10-03",
    paymentMode: "Bank Transfer",
    paymentStatus: "Paid",
    referenceNo: "SBI-IMPS-77192304",
    bankName: "SBI (A/C: ...4321)",
    notes: "Advance salary Rs. 2000 deducted as per authorization."
  },
  {
    id: "PAY-104",
    slipNo: "SLP-2026-10-104",
    salaryMonth: "October 2026",
    employeeName: "Rajesh Sharma",
    employeeCode: "SKY-EMP-104",
    department: "Legal & Compliance",
    designation: "Senior Legal Advisor",
    basicSalary: 38000,
    hra: 18000,
    incentives: 6000,
    salesCommission: 0,
    bonus: 8000,
    grossSalary: 70000,
    deductions: {
      pf: 4560,
      esic: 0,
      profTax: 200,
      advanceSalary: 0,
      loanRecovery: 0
    },
    totalDeductions: 4760,
    netSalary: 65240,
    paymentDate: "2026-10-04",
    paymentMode: "Cheque",
    paymentStatus: "Paid",
    referenceNo: "CHQ-004918-AXIS",
    bankName: "Axis Bank (A/C: ...1987)",
    notes: "Cheque handed over for monthly salary."
  },
  {
    id: "PAY-105",
    slipNo: "SLP-2026-10-105",
    salaryMonth: "October 2026",
    employeeName: "Priya Malhotra",
    employeeCode: "SKY-EMP-105",
    department: "CRM & Customer Relations",
    designation: "Customer Care Lead",
    basicSalary: 26000,
    hra: 13000,
    incentives: 3000,
    salesCommission: 2500,
    bonus: 3500,
    grossSalary: 48000,
    deductions: {
      pf: 3120,
      esic: 360,
      profTax: 200,
      advanceSalary: 0,
      loanRecovery: 0
    },
    totalDeductions: 3680,
    netSalary: 44320,
    paymentDate: "Pending",
    paymentMode: "UPI",
    paymentStatus: "Pending",
    referenceNo: "-",
    bankName: "Kotak Mahindra Bank",
    notes: "Awaiting final attendance confirmation for disbursement."
  }
];

export const initialInterviews = [
  {
    id: "INT-101",
    candidateName: "Ananya Iyer",
    email: "ananya.i@gmail.com",
    phone: "+91 98450 11223",
    position: "Senior Sales Relationship Manager",
    department: "Sales & Marketing",
    interviewDate: "2026-10-06",
    interviewTime: "11:30 AM",
    round: "Technical & Sales Pitch",
    interviewer: "Sarah Jenkins",
    status: "Scheduled",
    result: "Pending Evaluation",
    feedback: "Strong residential luxury sales track record with 4 years experience."
  },
  {
    id: "INT-102",
    candidateName: "Karan Johar",
    email: "karan.j@techmail.com",
    phone: "+91 98450 22334",
    position: "Site Quality Assurance Engineer",
    department: "Civil & Infrastructure",
    interviewDate: "2026-10-05",
    interviewTime: "02:00 PM",
    round: "Managerial & HR",
    interviewer: "Devon Miller",
    status: "Shortlisted",
    result: "Selected - Offer Pending",
    feedback: "Excellent concrete testing and RERA compliance knowledge."
  },
  {
    id: "INT-103",
    candidateName: "Meera Nair",
    email: "meera.nair@outlook.com",
    phone: "+91 98450 33445",
    position: "Legal Documentation Officer",
    department: "Legal & Compliance",
    interviewDate: "2026-10-02",
    interviewTime: "04:00 PM",
    round: "Final Director Round",
    interviewer: "Rajesh Sharma",
    status: "Selected",
    result: "Offer Letter Issued",
    feedback: "Passed legal title verification test with distinction."
  }
];

export const initialTransport = [
  {
    id: "TRP-101",
    routeNo: "Route-01 (CBD Metro to Site Complex)",
    vehicleType: "14-Seater AC Shuttle",
    vehicleNumber: "MH-12-AB-4455",
    driverName: "Suresh Patil",
    driverPhone: "+91 98220 99887",
    pickupPoints: "Metro Station Gate 2 -> Commercial Plaza -> Site Complex Gate 1",
    assignedEmployees: ["Sarah Jenkins", "Devon Miller", "Priya Malhotra"],
    morningTiming: "08:30 AM",
    eveningTiming: "06:30 PM",
    status: "Active"
  },
  {
    id: "TRP-102",
    routeNo: "Route-02 (Eastern Suburbs to Head Office)",
    vehicleType: "7-Seater Executive MPV",
    vehicleNumber: "MH-12-CD-8899",
    driverName: "Ramesh Shinde",
    driverPhone: "+91 98220 77665",
    pickupPoints: "East Junction -> Highway Circle -> Skyline Corporate Hub",
    assignedEmployees: ["Elena Rostova", "Rajesh Sharma"],
    morningTiming: "08:15 AM",
    eveningTiming: "06:15 PM",
    status: "Active"
  }
];

export const initialMeetings = [
  {
    id: "MTG-101",
    title: "Weekly Multi-Tower Sales & Pipeline Review",
    date: "2026-10-05",
    time: "10:00 AM - 11:30 AM",
    room: "Executive Boardroom A (12th Floor)",
    department: "Sales & Marketing",
    organizer: "Sarah Jenkins",
    attendees: "Sales Team, Channel Partners Lead, Marketing Head",
    agenda: "Review Navratri token clearances, bank loan disbursements, and customer possession roadmaps.",
    status: "Scheduled"
  },
  {
    id: "MTG-102",
    title: "Civil Infrastructure & Slab Casting Quality Review",
    date: "2026-10-06",
    time: "03:00 PM - 04:30 PM",
    room: "Site Conference Room 1",
    department: "Civil & Infrastructure",
    organizer: "Devon Miller",
    attendees: "Site Engineers, Structural Consultant, Contractor Leads",
    agenda: "Review Tower B 14th floor casting schedule, MEP plumbing lines, and safety audit reports.",
    status: "Scheduled"
  },
  {
    id: "MTG-103",
    title: "Quarterly Accounts Closing & Vendor Ledger Reconciliation",
    date: "2026-10-07",
    time: "11:00 AM - 12:30 PM",
    room: "Finance Discussion Room",
    department: "Finance & Accounts",
    organizer: "Elena Rostova",
    attendees: "Finance Officers, Internal Auditor",
    agenda: "Vendor TDS reconciliation, GST monthly returns, and Day Book audit.",
    status: "Scheduled"
  }
];

export const initialNoticePeriods = [
  {
    id: "NTC-101",
    employeeId: "EMP-03",
    employeeCode: "SKY-EMP-103",
    employeeName: "Devon Miller",
    department: "Civil & Infrastructure",
    designation: "Site Project Coordinator",
    resignationDate: "2026-09-15",
    noticeDuration: "30 Days",
    lastWorkingDate: "2026-10-15",
    handoverStatus: "In Progress (Handing over site blueprints)",
    assetClearance: "Pending",
    financeClearance: "Pending",
    hrClearance: "In Review",
    status: "Serving Notice",
    notes: "Transitioning projects to new Site Lead Engineer."
  }
];

export const initialAgentRequests = [
  {
    id: "REQ-101",
    agentName: "Apex Realty Partners",
    agentEmail: "apex.realty@gmail.com",
    requestType: "Commission Claim",
    subject: "Brokerage Commission Payout for Booking #BK-1002",
    details: "Booking token cleared for Unit A-402 (Customer: Dr. Thorne). Requesting release of 1.5% deal commission.",
    priority: "High",
    date: "2026-10-03",
    status: "In Review",
    adminRemarks: "Finance ledger check in progress with Accounts Department."
  },
  {
    id: "REQ-102",
    agentName: "Skyline Channel Partner - Metro",
    agentEmail: "partner.metro@skylinecrm.com",
    requestType: "Special Discount Approval",
    subject: "Additional 2% Festive Discount for Client Negotiation",
    details: "High-net-worth client interested in 4 BHK Penthouse Unit C-1801 subject to ₹50,000 spot booking concession.",
    priority: "Urgent",
    date: "2026-10-04",
    status: "Approved",
    adminRemarks: "Approved by Management for closing within 48 hours."
  },
  {
    id: "REQ-103",
    agentName: "Horizon Real Estate Brokers",
    agentEmail: "horizon.brokers@yahoo.com",
    requestType: "Marketing Collateral",
    subject: "Request for Tower B 3D Floorplans & Brochure Bundles",
    details: "Requiring 50 physical brochures and digital 4K walk-through videos for international NRI expo.",
    priority: "Medium",
    date: "2026-10-02",
    status: "Resolved",
    adminRemarks: "Digital brochures sent via cloud drive; physical pack dispatched via courier."
  }
];


