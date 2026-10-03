import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { enquiryService } from '../services/enquiry.service';
import { Enquiry } from '../types/crm.types';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import {
  MessageSquareText,
  ArrowLeft,
  ArrowRight,
  Building2,
  Clock,
} from 'lucide-react';

export const CustomerEnquiriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchEnquiries() {
      try {
        setIsLoading(true);
        const res = await enquiryService.getEnquiries({ limit: 50 });
        if (isMounted) {
          setEnquiries(res.enquiries || []);
        }
      } catch (err) {
        console.error('Failed to load customer enquiries:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchEnquiries();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'New Lead':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            Enquiry Received
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Advisor Assigned
          </span>
        );
      case 'Converted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Active Discussion
          </span>
        );
      case 'Dropped':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-[#1A2230] text-stone-600 dark:text-slate-400 border border-stone-200 dark:border-[#242F42]">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-[#1A2230] text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-[#242F42]">
            {status || 'Submitted'}
          </span>
        );
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 text-left animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-[#242F42] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400">
              <Link to="/customer" className="hover:text-stone-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <span>/</span>
              <span className="font-semibold text-stone-700 dark:text-slate-300">My Enquiries</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-slate-100">
                My Enquiries
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-[#141A24] border border-stone-200 dark:border-[#242F42] text-xs font-bold text-stone-700 dark:text-slate-300">
                {enquiries.length} {enquiries.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
          </div>

          <Link
            to="/discovery"
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 text-xs font-bold transition-colors shadow-xs"
          >
            Explore Properties
          </Link>
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" variant="primary" />
            <span className="text-xs text-stone-500 dark:text-slate-400 font-medium">
              Loading your enquiries...
            </span>
          </div>
        ) : enquiries.length > 0 ? (
          <div className="space-y-4">
            {enquiries.map((enq) => {
              const formattedDate = enq.enquiry_date
                ? new Date(enq.enquiry_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recent';

              const budgetFormatted = enq.budget
                ? `₹${(enq.budget / 10000000).toFixed(2)} Cr`
                : 'Budget Specified';

              return (
                <div
                  key={enq.id}
                  className="bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] p-5 shadow-xs hover:shadow-md transition-all space-y-4 text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-[#242F42] pb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-stone-900 dark:text-slate-100">
                          {enq.interested_property || 'Real Estate Inquiry'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>Submitted on {formattedDate}</span>
                          </span>
                          {enq.city && (
                            <>
                              <span>•</span>
                              <span>{enq.city}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(enq.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42]">
                      <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 uppercase block">Configuration</span>
                      <span className="font-bold text-stone-900 dark:text-slate-100 mt-0.5 block">{enq.configuration || 'Any'}</span>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42]">
                      <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 uppercase block">Investment Budget</span>
                      <span className="font-bold text-stone-900 dark:text-slate-100 mt-0.5 block">{budgetFormatted}</span>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42]">
                      <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 uppercase block">Assigned Advisor</span>
                      <span className="font-semibold text-stone-800 dark:text-slate-200 mt-0.5 block truncate">
                        {enq.assigned_name || 'SKYLINE Property Team'}
                      </span>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (enq.property_id) {
                            navigate(`/discovery/${enq.property_id}`);
                          } else {
                            navigate(`/discovery?q=${encodeURIComponent(enq.interested_property || '')}`);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <span>View Property</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="max-w-md mx-auto py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
              <MessageSquareText className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-stone-900 dark:text-slate-100">
                No enquiries submitted yet
              </h2>
              <p className="text-xs text-stone-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                When you click "Enquire Now" on any property, your inquiry and assigned advisor details will appear here.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/discovery')}
                leftIcon={<Building2 className="w-4 h-4" />}
              >
                Browse Properties
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
