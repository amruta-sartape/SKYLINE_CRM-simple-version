import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Phone, Mail, MapPin, Building2, User, DollarSign, Calendar, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const ClientEnquiryPage = () => {
  const { enquiries, addEnquiry, updateEnquiry, deleteEnquiry } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [viewingEnquiry, setViewingEnquiry] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    city: 'New York',
    budget: '$450,000 - $550,000',
    interestedProperty: 'Skyline Tower A',
    configuration: '2 BHK',
    leadSource: 'Website',
    salesExecutive: 'Sarah Jenkins',
    enquiryDate: new Date().toISOString().split('T')[0],
    status: 'New Lead',
    notes: ''
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.mobileNumber.trim()) {
      addToast('Please enter Customer Name and Mobile Number.', 'error');
      return;
    }

    if (editingEnquiry) {
      updateEnquiry(editingEnquiry.id, formData);
      addToast(`Enquiry ${editingEnquiry.id} updated successfully.`, 'success');
      setEditingEnquiry(null);
    } else {
      const created = addEnquiry(formData);
      addToast(`New enquiry ${created.id} recorded for ${created.customerName}.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      customerName: '',
      mobileNumber: '',
      email: '',
      city: 'New York',
      budget: '$450,000 - $550,000',
      interestedProperty: 'Skyline Tower A',
      configuration: '2 BHK',
      leadSource: 'Website',
      salesExecutive: 'Sarah Jenkins',
      enquiryDate: new Date().toISOString().split('T')[0],
      status: 'New Lead',
      notes: ''
    });
  };

  const openEditModal = (item) => {
    setEditingEnquiry(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteEnquiry(deletingId);
      addToast('Enquiry record deleted.', 'info');
      setDeletingId(null);
    }
  };

  const columns = [
    {
      header: 'Enquiry ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-brand-600',
      width: '110px'
    },
    {
      header: 'Customer Details',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customerName}</div>
          <div className="text-[11px] text-slate-500">{row.mobileNumber} • {row.email}</div>
          <div className="text-[10px] text-slate-400">{row.city}</div>
        </div>
      )
    },
    {
      header: 'Property & Unit',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.interestedProperty}</div>
          <div className="text-[11px] text-brand-700 font-bold">{row.configuration} ({row.budget})</div>
        </div>
      )
    },
    {
      header: 'Lead Source',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {row.leadSource}
        </span>
      )
    },
    {
      header: 'Sales Executive',
      accessor: 'salesExecutive',
      cellClassName: 'text-xs text-slate-700 font-medium'
    },
    {
      header: 'Date',
      accessor: 'enquiryDate',
      cellClassName: 'text-xs text-slate-500'
    },
    {
      header: 'Status',
      render: (row) => <Badge>{row.status || 'New Lead'}</Badge>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingEnquiry(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Enquiry"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Enquiry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Enquiry Track"
        subtitle="Capture incoming customer inquiries, preferred unit configurations, lead sources and assigned sales executives."
        breadcrumbs={['Skyline CRM', 'Sales & Leads', 'Client Enquiry']}
        actions={
          <button
            onClick={() => {
              setEditingEnquiry(null);
              setFormData({
                customerName: '',
                mobileNumber: '',
                email: '',
                city: 'New York',
                budget: '$450,000 - $550,000',
                interestedProperty: 'Skyline Tower A',
                configuration: '2 BHK',
                leadSource: 'Website',
                salesExecutive: 'Sarah Jenkins',
                enquiryDate: new Date().toISOString().split('T')[0],
                status: 'New Lead',
                notes: ''
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Enquiry</span>
          </button>
        }
      />

      <DataTable
        title="Client-Enquiries-Registry"
        columns={columns}
        data={enquiries}
        searchPlaceholder="Search customer, mobile, property, city..."
        filterKey="configuration"
        filterOptions={['1 BHK', '2 BHK', '3 BHK', '4 BHK']}
        onRowClick={(row) => setViewingEnquiry(row)}
      />

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingEnquiry) && (
        <Modal
          isOpen={isAddModalOpen || Boolean(editingEnquiry)}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingEnquiry(null);
          }}
          title={editingEnquiry ? `Edit Enquiry: ${editingEnquiry.id}` : 'Record New Client Enquiry'}
          subtitle="Complete customer contact details, property interest and source allocation."
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Jonathan Miller"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. New York"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Interested Property
                </label>
                <select
                  value={formData.interestedProperty}
                  onChange={(e) => setFormData({ ...formData, interestedProperty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Skyline Tower A">Skyline Tower A</option>
                  <option value="Skyline Heights">Skyline Heights</option>
                  <option value="Skyline Grandeur">Skyline Grandeur</option>
                  <option value="Skyline Green Park">Skyline Green Park</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Configuration
                </label>
                <select
                  value={formData.configuration}
                  onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Budget
                </label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="$450,000 - $550,000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Lead Source
                </label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Website">Website</option>
                  <option value="Facebook / Instagram">Facebook / Instagram</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Referral">Referral</option>
                  <option value="Property Portal">Property Portal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Sales Executive
                </label>
                <select
                  value={formData.salesExecutive}
                  onChange={(e) => setFormData({ ...formData, salesExecutive: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (Senior RM)</option>
                  <option value="Marcus Vance">Marcus Vance (Channel Partner)</option>
                  <option value="David Chen">David Chen (Sales Officer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Specific Requirements / Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Higher floor preference, east facing..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingEnquiry(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                {editingEnquiry ? 'Save Changes' : 'Save Enquiry'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Modal */}
      {viewingEnquiry && (
        <Modal
          isOpen={Boolean(viewingEnquiry)}
          onClose={() => setViewingEnquiry(null)}
          title={`Enquiry Profile: ${viewingEnquiry.id}`}
          subtitle={`Logged on ${viewingEnquiry.enquiryDate}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold">Customer Name:</span>
                <p className="text-slate-900 font-bold text-sm mt-0.5">{viewingEnquiry.customerName}</p>
                <p className="text-slate-500">{viewingEnquiry.city}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Contact:</span>
                <p className="text-slate-900 font-bold mt-0.5">{viewingEnquiry.mobileNumber}</p>
                <p className="text-slate-600">{viewingEnquiry.email}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Property Interest:</span>
                <p className="text-slate-900 font-bold mt-0.5">{viewingEnquiry.interestedProperty}</p>
                <p className="text-brand-700 font-semibold">{viewingEnquiry.configuration}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Budget Range:</span>
                <p className="text-emerald-700 font-bold mt-0.5">{viewingEnquiry.budget}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Lead Source:</span>
                <p className="text-slate-900 font-medium mt-0.5">{viewingEnquiry.leadSource}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Sales Executive:</span>
                <p className="text-slate-900 font-medium mt-0.5">{viewingEnquiry.salesExecutive}</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Remarks & Notes:</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1 italic">
                "{viewingEnquiry.notes || 'No specific notes recorded.'}"
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingEnquiry(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Close Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Customer Enquiry"
        message="Are you sure you want to delete this client enquiry record from Skyline CRM?"
      />
    </div>
  );
};
