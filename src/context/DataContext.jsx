import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialEnquiries,
  initialLeadTrack,
  initialFollowups,
  initialProperties,
  initialSiteVisits,
  initialNegotiations,
  initialBookings,
  initialFlatSales,
  initialClientPayments,
  initialDocumentCollections,
  initialLoanProcessings,
  initialAgreements,
  initialPossessions,
  initialCustomerSupports,
  initialVendors,
  initialPurchaseOrders,
  initialVendorPayments,
  initialPettyCash,
  initialPettyCashSummary,
  initialDayBook,
  initialDayBookSummary,
  initialEmployees,
  initialAttendance,
  initialLeaves,
  initialOvertime,
  initialHolidays,
  initialSalaryProcessing,
  initialEmployeePayments,
  initialInterviews,
  initialTransport,
  initialMeetings,
  initialNoticePeriods,
  initialAgentRequests
} from '../data/initialData';

const DataContext = createContext(null);
const STORAGE_PREFIX = 'skyline_crm_data_v5_';

export const DataProvider = ({ children }) => {
  const loadState = (key, defaultData) => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + key);
      return saved ? JSON.parse(saved) : defaultData;
    } catch {
      return defaultData;
    }
  };

  // State Stores
  const [enquiries, setEnquiries] = useState(() => loadState('enquiries', initialEnquiries));
  const [leadTrack, setLeadTrack] = useState(() => loadState('leadTrack', initialLeadTrack));
  const [followups, setFollowups] = useState(() => loadState('followups', initialFollowups));
  const [properties, setProperties] = useState(() => loadState('properties', initialProperties));
  const [siteVisits, setSiteVisits] = useState(() => loadState('siteVisits', initialSiteVisits));
  const [negotiations, setNegotiations] = useState(() => loadState('negotiations', initialNegotiations));
  const [bookings, setBookings] = useState(() => loadState('bookings', initialBookings));
  const [flatSales, setFlatSales] = useState(() => loadState('flatSales', initialFlatSales));
  const [clientPayments, setClientPayments] = useState(() => loadState('clientPayments', initialClientPayments));
  const [documentCollections, setDocumentCollections] = useState(() => loadState('documentCollections', initialDocumentCollections));
  const [loanProcessings, setLoanProcessings] = useState(() => loadState('loanProcessings', initialLoanProcessings));
  const [agreements, setAgreements] = useState(() => loadState('agreements', initialAgreements));
  const [possessions, setPossessions] = useState(() => loadState('possessions', initialPossessions));
  const [customerSupports, setCustomerSupports] = useState(() => loadState('customerSupports', initialCustomerSupports));
  
  // Vendor & Finance State Stores
  const [vendors, setVendors] = useState(() => loadState('vendors', initialVendors));
  const [purchaseOrders, setPurchaseOrders] = useState(() => loadState('purchaseOrders', initialPurchaseOrders));
  const [vendorPayments, setVendorPayments] = useState(() => loadState('vendorPayments', initialVendorPayments));
  const [pettyCash, setPettyCash] = useState(() => loadState('pettyCash', initialPettyCash));
  const [pettyCashSummary, setPettyCashSummary] = useState(() => loadState('pettyCashSummary', initialPettyCashSummary));
  const [dayBook, setDayBook] = useState(() => loadState('dayBook', initialDayBook));
  const [dayBookSummary, setDayBookSummary] = useState(() => loadState('dayBookSummary', initialDayBookSummary));
  
  // HR & Payroll State Stores
  const [employees, setEmployees] = useState(() => loadState('employees', initialEmployees));
  const [attendance, setAttendance] = useState(() => loadState('attendance', initialAttendance));
  const [leaves, setLeaves] = useState(() => loadState('leaves', initialLeaves));
  const [overtimes, setOvertimes] = useState(() => loadState('overtimes', initialOvertime));
  const [holidays, setHolidays] = useState(() => loadState('holidays', initialHolidays));
  const [salaryProcessing, setSalaryProcessing] = useState(() => loadState('salaryProcessing', initialSalaryProcessing));
  const [employeePayments, setEmployeePayments] = useState(() => loadState('employeePayments', initialEmployeePayments));
  const [interviews, setInterviews] = useState(() => loadState('interviews', initialInterviews));
  const [transportRoutes, setTransportRoutes] = useState(() => loadState('transportRoutes', initialTransport));
  const [meetings, setMeetings] = useState(() => loadState('meetings', initialMeetings));
  const [noticePeriods, setNoticePeriods] = useState(() => loadState('noticePeriods', initialNoticePeriods));
  const [agentRequests, setAgentRequests] = useState(() => loadState('agentRequests', initialAgentRequests));

  // Sync to local storage
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'enquiries', JSON.stringify(enquiries)); }, [enquiries]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'leadTrack', JSON.stringify(leadTrack)); }, [leadTrack]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'followups', JSON.stringify(followups)); }, [followups]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'properties', JSON.stringify(properties)); }, [properties]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'siteVisits', JSON.stringify(siteVisits)); }, [siteVisits]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'negotiations', JSON.stringify(negotiations)); }, [negotiations]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'flatSales', JSON.stringify(flatSales)); }, [flatSales]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'clientPayments', JSON.stringify(clientPayments)); }, [clientPayments]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'documentCollections', JSON.stringify(documentCollections)); }, [documentCollections]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'loanProcessings', JSON.stringify(loanProcessings)); }, [loanProcessings]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'agreements', JSON.stringify(agreements)); }, [agreements]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'possessions', JSON.stringify(possessions)); }, [possessions]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'customerSupports', JSON.stringify(customerSupports)); }, [customerSupports]);
  
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'purchaseOrders', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'vendorPayments', JSON.stringify(vendorPayments)); }, [vendorPayments]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'pettyCash', JSON.stringify(pettyCash)); }, [pettyCash]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'pettyCashSummary', JSON.stringify(pettyCashSummary)); }, [pettyCashSummary]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'dayBook', JSON.stringify(dayBook)); }, [dayBook]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'dayBookSummary', JSON.stringify(dayBookSummary)); }, [dayBookSummary]);
  
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'leaves', JSON.stringify(leaves)); }, [leaves]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'overtimes', JSON.stringify(overtimes)); }, [overtimes]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'holidays', JSON.stringify(holidays)); }, [holidays]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'salaryProcessing', JSON.stringify(salaryProcessing)); }, [salaryProcessing]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'employeePayments', JSON.stringify(employeePayments)); }, [employeePayments]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'interviews', JSON.stringify(interviews)); }, [interviews]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'transportRoutes', JSON.stringify(transportRoutes)); }, [transportRoutes]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'meetings', JSON.stringify(meetings)); }, [meetings]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'noticePeriods', JSON.stringify(noticePeriods)); }, [noticePeriods]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'agentRequests', JSON.stringify(agentRequests)); }, [agentRequests]);

  // 1. ENQUIRIES
  const addEnquiry = (data) => {
    const newItem = {
      id: `ENQ-${Date.now().toString().slice(-4)}`,
      status: 'New Lead',
      enquiryDate: new Date().toISOString().split('T')[0],
      ...data
    };
    setEnquiries(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateEnquiry = (id, data) => setEnquiries(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteEnquiry = (id) => setEnquiries(prev => prev.filter(i => i.id !== id));

  // 2. LEAD TRACK
  const addLead = (data) => {
    const newItem = {
      id: `LT-${Date.now().toString().slice(-4)}`,
      leadStatus: data.leadStatus || 'Qualified',
      lastContact: new Date().toISOString().split('T')[0],
      ...data
    };
    setLeadTrack(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateLead = (id, data) => setLeadTrack(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteLead = (id) => setLeadTrack(prev => prev.filter(i => i.id !== id));

  // 3. FOLLOWUPS
  const addFollowup = (data) => {
    const newItem = {
      id: `FLP-${Date.now().toString().slice(-4)}`,
      status: data.status || 'Pending',
      date: data.date || new Date().toISOString().split('T')[0],
      ...data
    };
    setFollowups(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateFollowup = (id, data) => setFollowups(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteFollowup = (id) => setFollowups(prev => prev.filter(i => i.id !== id));

  // 4. PROPERTIES
  const addProperty = (data) => {
    const newItem = {
      id: `PROP-${Date.now().toString().slice(-4)}`,
      availability: data.availability || 'Available',
      ...data
    };
    setProperties(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateProperty = (id, data) => setProperties(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteProperty = (id) => setProperties(prev => prev.filter(i => i.id !== id));

  // 5. SITE VISITS
  const addSiteVisit = (data) => {
    const newItem = {
      id: `SVT-${Date.now().toString().slice(-4)}`,
      status: data.status || 'Visited',
      visitDate: data.visitDate || new Date().toISOString().split('T')[0],
      ...data
    };
    setSiteVisits(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateSiteVisit = (id, data) => setSiteVisits(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteSiteVisit = (id) => setSiteVisits(prev => prev.filter(i => i.id !== id));

  // 6. NEGOTIATION
  const addNegotiation = (data) => {
    const newItem = {
      id: `NEG-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: data.status || 'Negotiating',
      managementApproval: data.managementApproval || 'Pending Approval',
      ...data
    };
    setNegotiations(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateNegotiation = (id, data) => setNegotiations(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteNegotiation = (id) => setNegotiations(prev => prev.filter(i => i.id !== id));

  // 7. BOOKINGS
  const addBooking = (data) => {
    const newItem = {
      id: `BKG-${Date.now().toString().slice(-4)}`,
      bookingNo: `SKY-BK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      bookingDate: new Date().toISOString().split('T')[0],
      bookingStatus: data.bookingStatus || 'Confirmed',
      ...data
    };
    setBookings(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateBooking = (id, data) => setBookings(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteBooking = (id) => setBookings(prev => prev.filter(i => i.id !== id));

  // 8. FLAT SALES
  const addFlatSale = (data) => {
    const newItem = {
      id: `SLS-${Date.now().toString().slice(-4)}`,
      invoiceNo: `INV-SKY-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      bookingDate: new Date().toISOString().split('T')[0],
      saleStatus: data.saleStatus || 'In Process',
      ...data
    };
    setFlatSales(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateFlatSale = (id, data) => setFlatSales(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteFlatSale = (id) => setFlatSales(prev => prev.filter(i => i.id !== id));

  // 9. CLIENT PAYMENTS
  const addClientPayment = (data) => {
    const newItem = {
      id: `CPY-${Date.now().toString().slice(-4)}`,
      receiptNo: `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentStatus: data.paymentStatus || 'Cleared',
      ...data
    };
    setClientPayments(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateClientPayment = (id, data) => setClientPayments(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteClientPayment = (id) => setClientPayments(prev => prev.filter(i => i.id !== id));

  // 10. DOCUMENT COLLECTION
  const addDocumentCollection = (data) => {
    const newItem = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      updatedDate: new Date().toISOString().split('T')[0],
      panCard: 'Pending',
      aadhaarCard: 'Pending',
      passportPhoto: 'Pending',
      addressProof: 'Pending',
      incomeProof: 'Pending',
      bankStatement: 'Pending',
      overallStatus: 'Pending (0%)',
      ...data
    };
    setDocumentCollections(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateDocumentCollection = (id, data) => setDocumentCollections(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteDocumentCollection = (id) => setDocumentCollections(prev => prev.filter(i => i.id !== id));

  // 11. LOAN PROCESSING
  const addLoanProcessing = (data) => {
    const newItem = {
      id: `LN-${Date.now().toString().slice(-4)}`,
      sanctionDate: data.sanctionDate || new Date().toISOString().split('T')[0],
      status: data.status || 'Loan Applied',
      ...data
    };
    setLoanProcessings(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateLoanProcessing = (id, data) => setLoanProcessings(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteLoanProcessing = (id) => setLoanProcessings(prev => prev.filter(i => i.id !== id));

  // 12. AGREEMENTS
  const addAgreement = (data) => {
    const newItem = {
      id: `AGR-${Date.now().toString().slice(-4)}`,
      agreementDate: new Date().toISOString().split('T')[0],
      status: data.status || 'Draft Generated',
      ...data
    };
    setAgreements(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateAgreement = (id, data) => setAgreements(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteAgreement = (id) => setAgreements(prev => prev.filter(i => i.id !== id));

  // 13. POSSESSIONS
  const addPossession = (data) => {
    const newItem = {
      id: `POS-${Date.now().toString().slice(-4)}`,
      status: data.status || 'Ready',
      ...data
    };
    setPossessions(prev => [newItem, ...prev]);
    return newItem;
  };
  const updatePossession = (id, data) => setPossessions(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deletePossession = (id) => setPossessions(prev => prev.filter(i => i.id !== id));

  // 14. CUSTOMER SUPPORT
  const addCustomerSupport = (data) => {
    const newItem = {
      id: `TCK-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: data.status || 'Open',
      ...data
    };
    setCustomerSupports(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateCustomerSupport = (id, data) => setCustomerSupports(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteCustomerSupport = (id) => setCustomerSupports(prev => prev.filter(i => i.id !== id));

  // ==========================================
  // VENDOR MANAGEMENT CRUD
  // ==========================================
  const addVendor = (data) => {
    const newItem = {
      id: `VND-${Date.now().toString().slice(-3)}`,
      status: data.status || 'Active',
      verificationStatus: data.verificationStatus || 'Verified',
      ...data
    };
    setVendors(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateVendor = (id, data) => setVendors(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  const deleteVendor = (id) => setVendors(prev => prev.filter(v => v.id !== id));

  // ==========================================
  // PURCHASE ORDERS CRUD
  // ==========================================
  const addPurchaseOrder = (data) => {
    const newItem = {
      id: `PO-${Date.now().toString().slice(-3)}`,
      poNumber: `SKY-PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: data.date || new Date().toISOString().split('T')[0],
      status: data.status || 'Approved',
      ...data
    };
    setPurchaseOrders(prev => [newItem, ...prev]);
    return newItem;
  };
  const updatePurchaseOrder = (id, data) => setPurchaseOrders(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const deletePurchaseOrder = (id) => setPurchaseOrders(prev => prev.filter(p => p.id !== id));

  // ==========================================
  // VENDOR PAYMENTS CRUD
  // ==========================================
  const addVendorPayment = (data) => {
    const newItem = {
      id: `VND-${Date.now().toString().slice(-3)}`,
      invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
      paymentStatus: data.paymentStatus || 'Pending',
      ...data
    };
    setVendorPayments(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateVendorPayment = (id, data) => setVendorPayments(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  const deleteVendorPayment = (id) => setVendorPayments(prev => prev.filter(v => v.id !== id));

  // ==========================================
  // PETTY CASH CRUD & SUMMARY
  // ==========================================
  const addPettyCash = (data) => {
    const amount = Number(data.amount) || 0;
    const newItem = {
      id: `PTY-${Date.now().toString().slice(-3)}`,
      voucherNumber: `VCHR-PC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: data.date || new Date().toISOString().split('T')[0],
      status: data.status || 'Approved',
      ...data,
      amount
    };
    setPettyCash(prev => [newItem, ...prev]);

    // Automatically recalculate petty cash balance
    setPettyCashSummary(prev => ({
      ...prev,
      cashSpent: (prev.cashSpent || 0) + amount,
      closingBalance: Math.max(0, (prev.openingBalance + prev.cashReceived) - ((prev.cashSpent || 0) + amount))
    }));

    return newItem;
  };
  const updatePettyCash = (id, data) => setPettyCash(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const deletePettyCash = (id) => setPettyCash(prev => prev.filter(p => p.id !== id));

  // ==========================================
  // DAY BOOK CRUD
  // ==========================================
  const addDayBookEntry = (data) => {
    const newItem = {
      id: `DB-${Date.now().toString().slice(-3)}`,
      entryNo: `DB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: data.date || new Date().toISOString().split('T')[0],
      ...data
    };
    setDayBook(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateDayBookEntry = (id, data) => setDayBook(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  const deleteDayBookEntry = (id) => setDayBook(prev => prev.filter(d => d.id !== id));

  // ==========================================
  // HR & PAYROLL CRUD
  // ==========================================
  const addEmployee = (data) => {
    const newItem = {
      id: `EMP-${Date.now().toString().slice(-4)}`,
      code: `SKY-EMP-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Active',
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      salaryStructure: {
        basicSalary: Number(data.basicSalary) || Math.round((Number(data.salaryMonthly) || 50000) * 0.5),
        hra: Number(data.hra) || Math.round((Number(data.salaryMonthly) || 50000) * 0.25),
        allowances: Number(data.allowances) || Math.round((Number(data.salaryMonthly) || 50000) * 0.25)
      },
      bankDetails: data.bankDetails || {
        bankName: data.bankName || 'HDFC Bank',
        accountNo: data.accountNo || '50100' + Math.floor(100000000 + Math.random() * 900000000),
        ifsc: data.ifsc || 'HDFC0001234',
        branch: data.branch || 'Main Commercial Branch'
      },
      panNumber: data.panNumber || 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F',
      aadhaarNumber: data.aadhaarNumber || '9876-5432-' + Math.floor(1000 + Math.random() * 9000),
      pfDetails: data.pfDetails || {
        uanNo: data.uanNo || '101' + Math.floor(100000000 + Math.random() * 900000000),
        esicNo: data.esicNo || '31000' + Math.floor(10000000 + Math.random() * 90000000)
      },
      ...data
    };
    setEmployees(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateEmployee = (id, data) => setEmployees(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteEmployee = (id) => setEmployees(prev => prev.filter(i => i.id !== id));

  // Attendance
  const addAttendance = (data) => {
    const newItem = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      date: data.date || new Date().toISOString().split('T')[0],
      status: data.status || 'Present',
      ...data
    };
    setAttendance(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateAttendance = (id, data) => setAttendance(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  const deleteAttendance = (id) => setAttendance(prev => prev.filter(a => a.id !== id));

  // Leaves
  const addLeave = (data) => {
    const newItem = {
      id: `LEV-${Date.now().toString().slice(-4)}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      approvedBy: '-',
      ...data
    };
    setLeaves(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateLeave = (id, data) => setLeaves(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  const deleteLeave = (id) => setLeaves(prev => prev.filter(l => l.id !== id));

  // Overtime
  const addOvertime = (data) => {
    const newItem = {
      id: `OT-${Date.now().toString().slice(-4)}`,
      date: data.date || new Date().toISOString().split('T')[0],
      status: 'Pending',
      approvedBy: '-',
      ...data
    };
    setOvertimes(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateOvertime = (id, data) => setOvertimes(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
  const deleteOvertime = (id) => setOvertimes(prev => prev.filter(o => o.id !== id));

  // Holidays
  const addHoliday = (data) => {
    const newItem = {
      id: `HOL-${Date.now().toString().slice(-4)}`,
      ...data
    };
    setHolidays(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateHoliday = (id, data) => setHolidays(prev => prev.map(h => h.id === id ? { ...h, ...data } : h));
  const deleteHoliday = (id) => setHolidays(prev => prev.filter(h => h.id !== id));

  // Salary Processing
  const addSalaryProcessing = (data) => {
    const basic = Number(data.basicSalary) || 0;
    const hra = Number(data.hra) || 0;
    const inc = Number(data.incentives) || 0;
    const comm = Number(data.salesCommission) || 0;
    const bonus = Number(data.bonus) || 0;
    const gross = basic + hra + inc + comm + bonus;

    const pf = Number(data.deductions?.pf ?? data.pf) || Math.round(basic * 0.12);
    const esic = Number(data.deductions?.esic ?? data.esic) || 0;
    const profTax = Number(data.deductions?.profTax ?? data.profTax) || 200;
    const adv = Number(data.deductions?.advanceSalary ?? data.advanceSalary) || 0;
    const loan = Number(data.deductions?.loanRecovery ?? data.loanRecovery) || 0;
    const totalDeduct = pf + esic + profTax + adv + loan;
    const net = gross - totalDeduct;

    const newItem = {
      id: `SP-${Date.now().toString().slice(-4)}`,
      basicSalary: basic,
      hra,
      incentives: inc,
      salesCommission: comm,
      bonus,
      grossSalary: gross,
      deductions: {
        pf,
        esic,
        profTax,
        advanceSalary: adv,
        loanRecovery: loan
      },
      totalDeductions: totalDeduct,
      netSalary: net,
      status: 'Processed',
      ...data
    };
    setSalaryProcessing(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateSalaryProcessing = (id, data) => setSalaryProcessing(prev => prev.map(sp => sp.id === id ? { ...sp, ...data } : sp));
  const deleteSalaryProcessing = (id) => setSalaryProcessing(prev => prev.filter(sp => sp.id !== id));

  const processBatchPayroll = (month) => {
    const newItems = employees.map(emp => {
      const basic = emp.salaryStructure?.basicSalary || Math.round((emp.salaryMonthly || 50000) * 0.5);
      const hra = emp.salaryStructure?.hra || Math.round((emp.salaryMonthly || 50000) * 0.25);
      const inc = 5000;
      const comm = emp.department.includes('Sales') ? 10000 : 0;
      const bonus = 4000;
      const gross = basic + hra + inc + comm + bonus;
      const pf = Math.round(basic * 0.12);
      const esic = gross < 21000 ? Math.round(gross * 0.0075) : 0;
      const profTax = 200;
      const totalDeduct = pf + esic + profTax;
      const net = gross - totalDeduct;

      return {
        id: `SP-${Date.now().toString().slice(-3)}-${emp.code}`,
        employeeId: emp.id,
        employeeCode: emp.code,
        employeeName: emp.fullName,
        department: emp.department,
        designation: emp.designation,
        month: month || 'Current Month',
        basicSalary: basic,
        hra,
        incentives: inc,
        salesCommission: comm,
        bonus,
        grossSalary: gross,
        deductions: {
          pf,
          esic,
          profTax,
          advanceSalary: 0,
          loanRecovery: 0
        },
        totalDeductions: totalDeduct,
        netSalary: net,
        status: 'Processed'
      };
    });
    setSalaryProcessing(newItems);
    return newItems;
  };

  // Employee Payments
  const addEmployeePayment = (data) => {
    const newItem = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      slipNo: `SLP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
      paymentStatus: data.paymentStatus || 'Paid',
      paymentMode: data.paymentMode || 'Bank Transfer',
      ...data
    };
    setEmployeePayments(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateEmployeePayment = (id, data) => setEmployeePayments(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const deleteEmployeePayment = (id) => setEmployeePayments(prev => prev.filter(p => p.id !== id));

  // Interviews & Recruitment
  const addInterview = (data) => {
    const newItem = { id: `INT-${Date.now().toString().slice(-4)}`, status: 'Scheduled', result: 'Pending Evaluation', ...data };
    setInterviews(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateInterview = (id, data) => setInterviews(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteInterview = (id) => setInterviews(prev => prev.filter(i => i.id !== id));

  // Employee Transport
  const addTransportRoute = (data) => {
    const newItem = { id: `TRP-${Date.now().toString().slice(-4)}`, status: 'Active', ...data };
    setTransportRoutes(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateTransportRoute = (id, data) => setTransportRoutes(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  const deleteTransportRoute = (id) => setTransportRoutes(prev => prev.filter(t => t.id !== id));

  // Meetings
  const addMeeting = (data) => {
    const newItem = { id: `MTG-${Date.now().toString().slice(-4)}`, status: 'Scheduled', ...data };
    setMeetings(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateMeeting = (id, data) => setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  const deleteMeeting = (id) => setMeetings(prev => prev.filter(m => m.id !== id));

  // Notice Period
  const addNoticePeriod = (data) => {
    const newItem = {
      id: `NTC-${Date.now().toString().slice(-4)}`,
      resignationDate: new Date().toISOString().split('T')[0],
      status: 'Serving Notice',
      assetClearance: 'Pending',
      financeClearance: 'Pending',
      hrClearance: 'Pending',
      ...data
    };
    setNoticePeriods(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateNoticePeriod = (id, data) => setNoticePeriods(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
  const deleteNoticePeriod = (id) => setNoticePeriods(prev => prev.filter(n => n.id !== id));

  // Agent Requests
  const addAgentRequest = (data) => {
    const newItem = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      priority: data.priority || 'Medium',
      ...data
    };
    setAgentRequests(prev => [newItem, ...prev]);
    return newItem;
  };
  const updateAgentRequest = (id, data) => setAgentRequests(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  const deleteAgentRequest = (id) => setAgentRequests(prev => prev.filter(r => r.id !== id));

  const resetToSampleData = () => {
    setEnquiries(initialEnquiries);
    setLeadTrack(initialLeadTrack);
    setFollowups(initialFollowups);
    setProperties(initialProperties);
    setSiteVisits(initialSiteVisits);
    setNegotiations(initialNegotiations);
    setBookings(initialBookings);
    setFlatSales(initialFlatSales);
    setClientPayments(initialClientPayments);
    setDocumentCollections(initialDocumentCollections);
    setLoanProcessings(initialLoanProcessings);
    setAgreements(initialAgreements);
    setPossessions(initialPossessions);
    setCustomerSupports(initialCustomerSupports);
    setVendors(initialVendors);
    setPurchaseOrders(initialPurchaseOrders);
    setVendorPayments(initialVendorPayments);
    setPettyCash(initialPettyCash);
    setPettyCashSummary(initialPettyCashSummary);
    setDayBook(initialDayBook);
    setDayBookSummary(initialDayBookSummary);
    setEmployees(initialEmployees);
    setAttendance(initialAttendance);
    setLeaves(initialLeaves);
    setOvertimes(initialOvertime);
    setHolidays(initialHolidays);
    setSalaryProcessing(initialSalaryProcessing);
    setEmployeePayments(initialEmployeePayments);
    setInterviews(initialInterviews);
    setTransportRoutes(initialTransport);
    setMeetings(initialMeetings);
    setNoticePeriods(initialNoticePeriods);
    setAgentRequests(initialAgentRequests);
  };

  return (
    <DataContext.Provider
      value={{
        enquiries,
        leadTrack,
        leads: leadTrack,
        followups,
        properties,
        siteVisits,
        negotiations,
        bookings,
        flatSales,
        clientPayments,
        documentCollections,
        loanProcessings,
        agreements,
        possessions,
        customerSupports,
        vendors,
        purchaseOrders,
        vendorPayments,
        pettyCash,
        pettyCashSummary,
        dayBook,
        dayBookSummary,
        employees,
        attendance,
        leaves,
        overtimes,
        holidays,
        salaryProcessing,
        employeePayments,
        interviews,
        transportRoutes,
        meetings,
        noticePeriods,
        agentRequests,

        addEnquiry, updateEnquiry, deleteEnquiry,
        addLead, updateLead, deleteLead,
        addFollowup, updateFollowup, deleteFollowup,
        addProperty, updateProperty, deleteProperty,
        addSiteVisit, updateSiteVisit, deleteSiteVisit,
        addNegotiation, updateNegotiation, deleteNegotiation,
        addBooking, updateBooking, deleteBooking,
        addFlatSale, updateFlatSale, deleteFlatSale,
        addClientPayment, updateClientPayment, deleteClientPayment,
        addDocumentCollection, updateDocumentCollection, deleteDocumentCollection,
        addLoanProcessing, updateLoanProcessing, deleteLoanProcessing,
        addAgreement, updateAgreement, deleteAgreement,
        addPossession, updatePossession, deletePossession,
        addCustomerSupport, updateCustomerSupport, deleteCustomerSupport,
        addVendor, updateVendor, deleteVendor,
        addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
        addVendorPayment, updateVendorPayment, deleteVendorPayment,
        addPettyCash, updatePettyCash, deletePettyCash,
        addDayBookEntry, updateDayBookEntry, deleteDayBookEntry,
        addEmployee, updateEmployee, deleteEmployee,
        addAttendance, updateAttendance, deleteAttendance,
        addLeave, updateLeave, deleteLeave,
        addOvertime, updateOvertime, deleteOvertime,
        addHoliday, updateHoliday, deleteHoliday,
        addSalaryProcessing, updateSalaryProcessing, deleteSalaryProcessing, processBatchPayroll,
        addEmployeePayment, updateEmployeePayment, deleteEmployeePayment,
        addInterview, updateInterview, deleteInterview,
        addTransportRoute, updateTransportRoute, deleteTransportRoute,
        addMeeting, updateMeeting, deleteMeeting,
        addNoticePeriod, updateNoticePeriod, deleteNoticePeriod,
        addAgentRequest, updateAgentRequest, deleteAgentRequest,
        resetToSampleData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
