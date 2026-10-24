import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, Building, ShieldCheck, Phone, Mail,
  MapPin, Landmark, Search, Filter, CheckCircle2, Clock, XCircle,
  FileText, Briefcase, UserCheck, AlertCircle
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

const VENDOR_CATEGORIES = [
  'Civil Contractor',
  'Electrical Contractor',
  'Plumbing Contractor',
  'Paint Contractor',
  'Material Supplier',
  'Lift Supplier',
  'Security Agency',
  'Housekeeping',
  'Architect',
  'Interior Designer',
  'Legal Consultant'
];

export const VendorManagement = () => {
  const { vendors, addVendor, updateVendor, deleteVendor } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [viewingVendor, setViewingVendor] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    vendorName: '',
    companyName: '',
    category: 'Civil Contractor',
    gstNumber: '',
    panNumber: '',
    contactPerson: '',
    mobile: '',
    email: '',
    address: '',
    bankName: 'Chase Bank Corporate',
    accountNo: '',
    ifsc: '',
    branch: '',
    status: 'Active',
    verificationStatus: 'Verified',
    enquiryNotes: '',
    followupDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.vendorName.trim() || !formData.mobile.trim()) {
      addToast('Please enter Vendor Name and Mobile Number.', 'error');
      return;
    }

    if (editingVendor) {
      updateVendor(editingVendor.id, formData);
      addToast(`Vendor ${editingVendor.vendorName} updated successfully.`, 'success');
      setEditingVendor(null);
    } else {
      const created = addVendor(formData);
      addToast(`Vendor ${created.vendorName} registered successfully.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      vendorName: '',
      companyName: '',
      category: 'Civil Contractor',
      gstNumber: '',
      panNumber: '',
      contactPerson: '',
      mobile: '',
      email: '',
      address: '',
      bankName: 'Chase Bank Corporate',
      accountNo: '',
      ifsc: '',
      branch: '',
      status: 'Active',
      verificationStatus: 'Verified',
      enquiryNotes: '',
      followupDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    });
  };

  const openEditModal = (item) => {
    setEditingVendor(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteVendor(deletingId);
      addToast('Vendor record removed from master directory.', 'info');
      setDeletingId(null);
    }
  };

  const columns = [
    {
      header: 'Vendor ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-brand-700',
      width: '95px'
    },
    {
      header: 'Vendor & Company',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            {row.vendorName}
          </div>
          <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{row.companyName}</div>
        </div>
      )
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
          {row.category}
        </span>
      )
    },
    {
      header: 'Tax Identifiers',
      render: (row) => (
        <div className="text-[10px] font-mono text-slate-600">
          <div>GST: <span className="font-bold text-slate-800">{row.gstNumber || 'N/A'}</span></div>
          <div>PAN: <span className="font-semibold text-slate-700">{row.panNumber || 'N/A'}</span></div>
        </div>
      )
    },
    {
      header: 'Contact Person',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">{row.contactPerson || 'Primary Contact'}</div>
          <div className="text-[10px] text-slate-500">{row.mobile} • {row.email}</div>
        </div>
      )
    },
    {
      header: 'Verification',
      render: (row) => (
        <Badge variant={row.verificationStatus === 'Verified' ? 'success' : row.verificationStatus === 'Under Verification' ? 'warning' : 'danger'}>
          {row.verificationStatus || 'Verified'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingVendor(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Profile & Bank Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Vendor"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Vendor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const totalVendors = vendors.length;
  const verifiedVendors = vendors.filter(v => v.verificationStatus === 'Verified').length;
  const underVerification = vendors.filter(v => v.verificationStatus === 'Under Verification').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Master & Contractor Management"
        description="Comprehensive directory of contractors, civil suppliers, lift engineers, and legal consultants."
        breadcrumbs={[
          { label: 'Finance & Procurement' },
          { label: 'Vendor Management', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                vendorName: '',
                companyName: '',
                category: 'Civil Contractor',
                gstNumber: '',
                panNumber: '',
                contactPerson: '',
                mobile: '',
                email: '',
                address: '',
                bankName: 'Chase Bank Corporate',
                accountNo: '',
                ifsc: '',
                branch: '',
                status: 'Active',
                verificationStatus: 'Verified',
                enquiryNotes: '',
                followupDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Register New Vendor
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registered Vendors</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalVendors} Companies</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 11 trade categories</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Verified & Approved</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{verifiedVendors}</div>
          <div className="text-[11px] text-emerald-600 mt-1">GST & PAN compliance cleared</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Under Verification</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{underVerification}</div>
          <div className="text-[11px] text-amber-600 mt-1">Pending banking/tax clearance</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Active Supply Channels</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">11 Categories</div>
          <div className="text-[11px] text-blue-600 mt-1">Civil, Steel, Lifts, MEP, Legal</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Vendor Master Registry"
        subtitle="Search by contractor name, trade category, or GST number"
        data={vendors}
        columns={columns}
        searchPlaceholder="Search vendor name, contact person, or GST..."
        filterKey="category"
        filterOptions={[
          { label: 'All Categories', value: 'ALL' },
          ...VENDOR_CATEGORIES.map(cat => ({ label: cat, value: cat }))
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingVendor}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingVendor(null);
        }}
        title={editingVendor ? `Edit Vendor: ${editingVendor.vendorName}` : 'Vendor Registration'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Vendor Trade Name *</label>
              <input
                type="text"
                required
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Apex Infrastructure Works"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Registered Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Apex Civil & Engineering Solutions Pvt Ltd"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Vendor Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                {VENDOR_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">GST Number</label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none uppercase"
                placeholder="e.g. 27AAACA1234A1Z5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">PAN Number</label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none uppercase"
                placeholder="e.g. AAACA1234A"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Rajesh Sharma"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile No *</label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="vendor@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Office / Works Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="e.g. Plot 42, Industrial Development Area, New York"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-slate-500" />
              Vendor Banking & Payment Settlement Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNo}
                  onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold font-mono"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">IFSC / Routing Code</label>
                <input
                  type="text"
                  value={formData.ifsc}
                  onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold font-mono uppercase"
                  placeholder="CHAS0001234"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Branch</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  placeholder="Main Branch"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Verification Status</label>
              <select
                value={formData.verificationStatus}
                onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Verified">Verified</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Next Follow-up / Review</label>
              <input
                type="date"
                value={formData.followupDate}
                onChange={(e) => setFormData({ ...formData, followupDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Vendor Scope & Enquiry Notes</label>
            <textarea
              rows={2}
              value={formData.enquiryNotes || ''}
              onChange={(e) => setFormData({ ...formData, enquiryNotes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="Contractual scope, material delivery lead time, rate agreements..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingVendor(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingVendor ? 'Update Vendor' : 'Save Vendor Registration'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingVendor && (
        <Modal
          isOpen={true}
          onClose={() => setViewingVendor(null)}
          title={`Vendor Dossier: ${viewingVendor.vendorName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Vendor Code</span>
                <div className="font-mono text-xs font-bold text-brand-700">{viewingVendor.id}</div>
              </div>
              <Badge variant={viewingVendor.verificationStatus === 'Verified' ? 'success' : 'warning'}>
                {viewingVendor.verificationStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Company Name</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingVendor.companyName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Category</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingVendor.category}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">GST Registration</span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{viewingVendor.gstNumber}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">PAN Number</span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{viewingVendor.panNumber}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Contact Person</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingVendor.contactPerson} ({viewingVendor.mobile})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Email</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewingVendor.email}</p>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Bank & Settlement Account</span>
              <div className="text-xs text-slate-800 font-medium">
                <div>Bank: <span className="font-bold">{viewingVendor.bankName}</span> ({viewingVendor.branch})</div>
                <div className="font-mono text-[11px] text-slate-600">A/C: {viewingVendor.accountNo} • IFSC: {viewingVendor.ifsc}</div>
              </div>
            </div>

            {viewingVendor.enquiryNotes && (
              <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-brand-700">Scope / Agreement Notes</span>
                <p className="text-slate-800 mt-0.5">{viewingVendor.enquiryNotes}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingVendor(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Vendor Record"
        message="Are you sure you want to remove this vendor from the active procurement master?"
      />
    </div>
  );
};
