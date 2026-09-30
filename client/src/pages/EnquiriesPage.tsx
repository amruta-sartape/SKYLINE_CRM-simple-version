import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { EnquiryFormModal } from '../components/crm/EnquiryFormModal';
import { EnquiryViewModal } from '../components/crm/EnquiryViewModal';
import { ConvertToLeadModal } from '../components/crm/ConvertToLeadModal';
import { enquiryService } from '../services/enquiry.service';
import { leadService } from '../services/lead.service';
import { useToast } from '../context/ToastContext';
import {
  Enquiry,
  EnquiryFormData,
  ConvertEnquiryFormData,
  UserSummary,
} from '../types/crm.types';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  ArrowRight,
  Phone,
  Building,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export const EnquiriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedExecutive, setSelectedExecutive] = useState<string>('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [activeEnquiry, setActiveEnquiry] = useState<Enquiry | null>(null);
  const [executives, setExecutives] = useState<UserSummary[]>([]);

  // Load staff/executives for dropdowns
  useEffect(() => {
    leadService
      .getExecutives()
      .then(setExecutives)
      .catch((err) => console.warn('Failed to load staff list:', err));
  }, []);

  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page,
        limit,
        search: searchTerm || undefined,
        source: selectedSource || undefined,
        configuration: selectedConfig || undefined,
        status: selectedStatus || undefined,
        assigned_to: selectedExecutive || undefined,
      };

      const result = await enquiryService.getEnquiries(params);
      setEnquiries(result.enquiries);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch enquiries.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm, selectedSource, selectedConfig, selectedStatus, selectedExecutive]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Actions
  const handleCreateOrUpdate = async (data: EnquiryFormData) => {
    if (activeEnquiry) {
      await enquiryService.updateEnquiry(activeEnquiry.id, data);
      showToast({
        variant: 'success',
        title: 'Enquiry Updated',
        message: `Changes to ${data.customer_name}'s enquiry saved.`,
      });
    } else {
      await enquiryService.createEnquiry(data);
      showToast({
        variant: 'success',
        title: 'Enquiry Logged',
        message: `New enquiry for ${data.customer_name} added to CRM.`,
      });
    }
    fetchEnquiries();
  };

  const handleConvertToLead = async (enquiryId: string, data: ConvertEnquiryFormData) => {
    const result = await enquiryService.convertToLead(enquiryId, data);
    showToast({
      variant: 'success',
      title: 'Converted to Lead',
      message: `${result.lead.customer_name} is now an active CRM Lead!`,
    });
    fetchEnquiries();
    navigate(`/leads/${result.lead.id}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSource('');
    setSelectedConfig('');
    setSelectedStatus('');
    setSelectedExecutive('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AppShell>
      <div className="space-y-6 text-left animate-fade-in">
        {/* Header Title & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                Client Enquiries
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {total} Total
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Capture, qualify, and convert marketing inquiries from digital channels into CRM leads.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setActiveEnquiry(null);
              setIsFormModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Enquiry
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="error"
            title="Unable to load enquiries"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Filter Bar & Search */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-subtle space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search name, phone, project, city..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Source Filter */}
            <div>
              <select
                value={selectedSource}
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800"
              >
                <option value="">All Sources</option>
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

            {/* Configuration Filter */}
            <div>
              <select
                value={selectedConfig}
                onChange={(e) => {
                  setSelectedConfig(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800"
              >
                <option value="">All Flat Types</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800"
              >
                <option value="">All Statuses</option>
                <option value="New Lead">New Lead</option>
                <option value="In Progress">In Progress</option>
                <option value="Converted">Converted</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={clearFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Enquiries Table Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" variant="primary" />
              <span className="text-xs text-slate-500 font-medium">Loading enquiries...</span>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Enquiries Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {searchTerm || selectedSource || selectedConfig || selectedStatus
                  ? 'No enquiries match your active filter criteria. Try adjusting or resetting your search filters.'
                  : 'Start capturing prospective property buyers by adding your first client enquiry.'}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveEnquiry(null);
                  setIsFormModalOpen(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Log First Enquiry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Interested Property</th>
                    <th className="py-3 px-4">Config</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Assigned Executive</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Enquiry Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enquiries.map((enq) => {
                    const isConverted =
                      enq.status === 'Converted' || Boolean(enq.converted_lead_id);

                    return (
                      <tr
                        key={enq.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Customer */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{enq.customer_name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{enq.phone}</span>
                            {enq.city && <span>• {enq.city}</span>}
                          </div>
                        </td>

                        {/* Interested Property */}
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {enq.interested_property}
                        </td>

                        {/* Config */}
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 font-bold text-[10px] bg-slate-100 text-slate-800 rounded border border-slate-200">
                            {enq.configuration}
                          </span>
                        </td>

                        {/* Budget */}
                        <td className="py-3 px-4 font-bold text-slate-900">
                          ₹{(enq.budget / 100000).toFixed(1)} L
                        </td>

                        {/* Source */}
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                            {enq.lead_source}
                          </span>
                        </td>

                        {/* Assigned Executive */}
                        <td className="py-3 px-4">
                          <span className="text-slate-700 font-medium">
                            {enq.assigned_name || (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <Badge enquiryStatus={enq.status} size="sm" />
                        </td>

                        {/* Enquiry Date */}
                        <td className="py-3 px-4 text-[11px] text-slate-500">
                          {enq.enquiry_date ? enq.enquiry_date.split('T')[0] : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveEnquiry(enq);
                                setIsViewModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveEnquiry(enq);
                                setIsFormModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                              title="Edit enquiry"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Convert to Lead */}
                            {!isConverted ? (
                              <Button
                                variant="luxury"
                                size="sm"
                                onClick={() => {
                                  setActiveEnquiry(enq);
                                  setIsConvertModalOpen(true);
                                }}
                                rightIcon={<ArrowRight className="w-3 h-3" />}
                              >
                                Convert
                              </Button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Converted</span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoading && enquiries.length > 0 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(page - 1) * limit + 1} to{' '}
                {Math.min(page * limit, total)} of {total} enquiries
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="font-semibold text-slate-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EnquiryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={activeEnquiry}
        executives={executives}
      />

      <EnquiryViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        enquiry={activeEnquiry}
        onEdit={(enq) => {
          setActiveEnquiry(enq);
          setIsFormModalOpen(true);
        }}
        onConvert={(enq) => {
          setActiveEnquiry(enq);
          setIsConvertModalOpen(true);
        }}
        onNavigateToLead={(leadId) => navigate(`/leads/${leadId}`)}
      />

      <ConvertToLeadModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        enquiry={activeEnquiry}
        onSubmit={handleConvertToLead}
        executives={executives}
      />
    </AppShell>
  );
};
