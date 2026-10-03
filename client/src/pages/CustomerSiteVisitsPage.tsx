import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { siteVisitService } from '../services/siteVisit.service';
import { SiteVisit } from '../types/siteVisit.types';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import {
  CalendarCheck,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Building2,
  User,
  MapPin,
} from 'lucide-react';

export const CustomerSiteVisitsPage: React.FC = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchVisits() {
      try {
        setIsLoading(true);
        const res = await siteVisitService.list({ limit: 50 });
        if (isMounted) {
          setVisits(res.visits || []);
        }
      } catch (err) {
        console.error('Failed to load customer site visits:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchVisits();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Scheduled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            Scheduled
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Tour Completed
          </span>
        );
      case 'Rescheduled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Rescheduled
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-[#1A2230] text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-[#242F42]">
            {status || 'Upcoming'}
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
              <span className="font-semibold text-stone-700 dark:text-slate-300">My Site Visits</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-slate-100">
                My Site Visits
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-[#141A24] border border-stone-200 dark:border-[#242F42] text-xs font-bold text-stone-700 dark:text-slate-300">
                {visits.length} {visits.length === 1 ? 'Tour' : 'Tours'}
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
              Loading your scheduled site visits...
            </span>
          </div>
        ) : visits.length > 0 ? (
          <div className="space-y-4">
            {visits.map((visit) => {
              const formattedDate = visit.visit_date
                ? new Date(visit.visit_date).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Date Unspecified';

              return (
                <div
                  key={visit.id}
                  className="bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] p-5 shadow-xs hover:shadow-md transition-all space-y-4 text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-[#242F42] pb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                        <CalendarCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-stone-900 dark:text-slate-100">
                          {visit.property_title || visit.project_name || 'Property Tour'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                          {visit.project_city && (
                            <>
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span>{visit.project_city}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>Type: {visit.visit_type || 'Direct Visit'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(visit.visit_status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42]">
                      <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 uppercase block">Scheduled Date</span>
                      <span className="font-bold text-stone-900 dark:text-slate-100 mt-0.5 block flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42]">
                      <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 uppercase block">Visit Time</span>
                      <span className="font-bold text-stone-900 dark:text-slate-100 mt-0.5 block flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{visit.visit_time || '10:00 AM'}</span>
                      </span>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42]">
                      <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 uppercase block">Executive / Advisor</span>
                      <span className="font-semibold text-stone-800 dark:text-slate-200 mt-0.5 block truncate flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{visit.assigned_user_name || 'SKYLINE Property Guide'}</span>
                      </span>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (visit.property_id) {
                            navigate(`/discovery/${visit.property_id}`);
                          } else if (visit.project_id) {
                            navigate(`/discovery/${visit.project_id}`);
                          } else {
                            navigate('/discovery');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <span>View Property</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {visit.remarks && (
                    <div className="p-3 bg-stone-50/70 dark:bg-[#101622]/70 rounded-xl border border-stone-200/60 dark:border-[#242F42] text-xs text-stone-600 dark:text-slate-400">
                      <span className="font-semibold text-stone-800 dark:text-slate-200">Notes:</span> {visit.remarks}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="max-w-md mx-auto py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
              <CalendarCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-stone-900 dark:text-slate-100">
                No site visits scheduled yet
              </h2>
              <p className="text-xs text-stone-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Schedule a personalized in-person visit on any property to tour the location and inspect premises with a dedicated SKYLINE advisor.
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
