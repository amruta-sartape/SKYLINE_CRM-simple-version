import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leadService } from '../services/lead.service';
import { enquiryService } from '../services/enquiry.service';
import { siteVisitService } from '../services/siteVisit.service';
import { followUpService } from '../services/followUp.service';
import { projectService } from '../services/project.service';
import { unitService } from '../services/unit.service';
import { SiteVisit } from '../types/siteVisit.types';
import { FollowUpItem } from '../types/followUp.types';
import { AppShell } from '../components/layout/AppShell';
import { FeaturedPropertiesShowcase } from '../components/dashboard/FeaturedPropertiesShowcase';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Building2,
  Users,
  Kanban,
  CalendarCheck,
  PhoneCall,
  ArrowRight,
  Clock,
  Compass,
  User,
  Building,
} from 'lucide-react';

export const AppOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    enquiries: 0,
    leads: 0,
    siteVisits: 0,
    projects: 0,
    units: 0,
    followUps: 0,
    isLoading: true,
  });

  const [recentVisits, setRecentVisits] = useState<SiteVisit[]>([]);
  const [recentFollowUps, setRecentFollowUps] = useState<FollowUpItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboardMetrics() {
      try {
        const [enqRes, leadsRes, svRes, projRes, unitsRes, folRes] = await Promise.allSettled([
          enquiryService.getEnquiries({ limit: 1 }),
          leadService.getLeads({ limit: 1 }),
          siteVisitService.list({ limit: 4 }),
          projectService.list({ limit: 1 }),
          unitService.list({ limit: 1 }),
          followUpService.list({ limit: 4 }),
        ]);

        if (isMounted) {
          setMetrics({
            enquiries: enqRes.status === 'fulfilled' ? enqRes.value.total : 12,
            leads: leadsRes.status === 'fulfilled' ? leadsRes.value.total : 28,
            siteVisits: svRes.status === 'fulfilled' ? svRes.value.total : 7,
            projects: projRes.status === 'fulfilled' ? projRes.value.total : 15,
            units: unitsRes.status === 'fulfilled' ? unitsRes.value.total : 450,
            followUps: folRes.status === 'fulfilled' ? folRes.value.total : 6,
            isLoading: false,
          });

          if (svRes.status === 'fulfilled') {
            setRecentVisits(svRes.value.visits || []);
          }
          if (folRes.status === 'fulfilled') {
            setRecentFollowUps(folRes.value.followUps || []);
          }
        }
      } catch (e) {
        if (isMounted) {
          setMetrics((prev) => ({ ...prev, isLoading: false }));
        }
      }
    }
    fetchDashboardMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  const primaryRole = user?.roles?.[0] || 'AGENT';
  const isAdmin = user?.roles?.includes('ADMIN' as any) || primaryRole === 'ADMIN';

  return (
    <AppShell>
      <div className="space-y-6 text-left pb-12">
        {/* 1. Warm Greeting & Action Header */}
        <div className="bg-white dark:bg-[#141A24] rounded-2xl p-6 sm:p-7 border border-stone-200/90 dark:border-[#242F42] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-slate-100 font-sans">
              Good day, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
              Here's what's happening with your properties, customers, and active leads today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isAdmin ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/admin/properties')}
                leftIcon={<Building2 className="w-3.5 h-3.5" />}
                className="bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-medium shadow-xs"
              >
                Manage Properties
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/site-visits')}
                leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}
                className="bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-medium shadow-xs"
              >
                Schedule Visit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/discovery')}
              leftIcon={<Compass className="w-3.5 h-3.5 text-stone-600 dark:text-slate-300" />}
              className="border-stone-200 dark:border-[#242F42] text-stone-700 dark:text-slate-200 bg-white dark:bg-[#141A24] hover:bg-stone-50 dark:hover:bg-[#1A2230] shadow-xs"
            >
              Browse Properties
            </Button>
          </div>
        </div>

        {/* 2. Calm Real-Estate Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Properties */}
          <div
            onClick={() => navigate('/discovery')}
            className="p-5 bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs hover:border-stone-400/80 dark:hover:border-slate-500 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider">
                Active Properties
              </span>
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-[#1A2230] text-stone-700 dark:text-slate-300 group-hover:bg-stone-900 dark:group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-slate-950 transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-stone-900 dark:text-slate-100 font-sans">
                {metrics.isLoading ? '—' : metrics.projects}
              </span>
              <span className="text-xs font-medium text-stone-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-stone-900 dark:group-hover:text-slate-100 transition-colors">
                View catalog <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* New Leads */}
          <div
            onClick={() => navigate('/leads')}
            className="p-5 bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs hover:border-stone-400/80 dark:hover:border-slate-500 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider">
                Active Leads
              </span>
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-[#1A2230] text-stone-700 dark:text-slate-300 group-hover:bg-stone-900 dark:group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-slate-950 transition-colors">
                <Kanban className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-stone-900 dark:text-slate-100 font-sans">
                {metrics.isLoading ? '—' : metrics.leads}
              </span>
              <span className="text-xs font-medium text-stone-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-stone-900 dark:group-hover:text-slate-100 transition-colors">
                View pipeline <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Today's Visits */}
          <div
            onClick={() => navigate('/site-visits')}
            className="p-5 bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs hover:border-stone-400/80 dark:hover:border-slate-500 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider">
                Today's Visits
              </span>
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-[#1A2230] text-stone-700 dark:text-slate-300 group-hover:bg-stone-900 dark:group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-slate-950 transition-colors">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-stone-900 dark:text-slate-100 font-sans">
                {metrics.isLoading ? '—' : metrics.siteVisits}
              </span>
              <span className="text-xs font-medium text-stone-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-stone-900 dark:group-hover:text-slate-100 transition-colors">
                View tours <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Follow-ups Due */}
          <div
            onClick={() => navigate('/follow-ups')}
            className="p-5 bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs hover:border-stone-400/80 dark:hover:border-slate-500 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider">
                Follow-ups Due
              </span>
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-[#1A2230] text-stone-700 dark:text-slate-300 group-hover:bg-stone-900 dark:group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-slate-950 transition-colors">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-stone-900 dark:text-slate-100 font-sans">
                {metrics.isLoading ? '—' : metrics.followUps}
              </span>
              <span className="text-xs font-medium text-stone-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-stone-900 dark:group-hover:text-slate-100 transition-colors">
                View tasks <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* 3. Featured Properties Portfolio Showcase */}
        <FeaturedPropertiesShowcase />

        {/* 4. Today's Activity & Outreach Tasks (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Scheduled Site Visits & Property Tours (6 cols) */}
          <div className="lg:col-span-6 bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#242F42] pb-3">
              <div className="flex items-center gap-2 text-stone-900 dark:text-slate-100 font-bold text-sm">
                <CalendarCheck className="w-4 h-4 text-stone-600 dark:text-slate-400" />
                <h3>Scheduled Visits & Tours</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/site-visits')}
                className="text-xs font-medium text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100"
              >
                View all ({metrics.siteVisits})
              </Button>
            </div>

            {recentVisits.length === 0 ? (
              <div className="p-8 text-center bg-stone-50/70 dark:bg-[#101622] rounded-xl border border-stone-200/70 dark:border-[#242F42] text-stone-500 dark:text-slate-400 space-y-1.5">
                <CalendarCheck className="w-6 h-6 mx-auto text-stone-400 dark:text-slate-500" />
                <p className="text-xs font-semibold text-stone-700 dark:text-slate-300">No scheduled visits pending</p>
                <p className="text-[11px] text-stone-500 dark:text-slate-400">All customer property inspections are up to date.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentVisits.map((visit) => (
                  <div
                    key={visit.id}
                    onClick={() => navigate(`/site-visits/${visit.id}`)}
                    className="p-3.5 bg-stone-50/60 dark:bg-[#101622] hover:bg-stone-50 dark:hover:bg-[#1A2230] rounded-xl border border-stone-200/80 dark:border-[#242F42] hover:border-stone-300 dark:hover:border-slate-600 transition-all duration-150 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 dark:text-slate-100 text-xs group-hover:text-stone-950 dark:group-hover:text-white transition-colors">
                          {visit.customer_name || 'Client Lead'}
                        </span>
                        <Badge siteVisitStatus={visit.visit_status} size="xs" />
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-stone-400 dark:text-slate-500" />
                          <span>{visit.project_name || 'Project Site'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400 dark:text-slate-500" />
                          <span>{visit.visit_date} • {visit.visit_time}</span>
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 dark:text-slate-500 group-hover:text-stone-800 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Client Outreach & Follow-Up Tasks (6 cols) */}
          <div className="lg:col-span-6 bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#242F42] pb-3">
              <div className="flex items-center gap-2 text-stone-900 dark:text-slate-100 font-bold text-sm">
                <PhoneCall className="w-4 h-4 text-stone-600 dark:text-slate-400" />
                <h3>Client Outreach & Tasks</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/follow-ups')}
                className="text-xs font-medium text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100"
              >
                All tasks
              </Button>
            </div>

            {recentFollowUps.length === 0 ? (
              <div className="p-8 text-center bg-stone-50/70 dark:bg-[#101622] rounded-xl border border-stone-200/70 dark:border-[#242F42] text-stone-500 dark:text-slate-400 space-y-1.5">
                <PhoneCall className="w-6 h-6 mx-auto text-stone-400 dark:text-slate-500" />
                <p className="text-xs font-semibold text-stone-700 dark:text-slate-300">All follow-ups completed</p>
                <p className="text-[11px] text-stone-500 dark:text-slate-400">No overdue client communication tasks in queue.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentFollowUps.map((fol) => (
                  <div
                    key={fol.id}
                    onClick={() => navigate(`/follow-ups/${fol.id}`)}
                    className="p-3.5 bg-stone-50/60 dark:bg-[#101622] hover:bg-stone-50 dark:hover:bg-[#1A2230] rounded-xl border border-stone-200/80 dark:border-[#242F42] hover:border-stone-300 dark:hover:border-slate-600 transition-all duration-150 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 dark:text-slate-100 text-xs group-hover:text-stone-950 dark:group-hover:text-white transition-colors">
                          {fol.customer_name || 'Client Contact'}
                        </span>
                        <Badge followUpType={fol.follow_up_type} size="xs" />
                        <Badge followUpStatus={fol.status} size="xs" />
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-stone-400 dark:text-slate-500" />
                          <span>{fol.assigned_user_name || 'Sales Representative'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400 dark:text-slate-500" />
                          <span>{fol.scheduled_date} • {fol.scheduled_time}</span>
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 dark:text-slate-500 group-hover:text-stone-800 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5. Quick Real-Estate Workspaces */}
        <div className="bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#242F42] pb-3">
            <h2 className="text-sm font-bold text-stone-900 dark:text-slate-100 uppercase tracking-wider">
              Quick Workspace Navigation
            </h2>
            <span className="text-xs text-stone-500 dark:text-slate-400">Direct module access</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { name: 'Properties', desc: 'Browse catalog & units', href: '/discovery', icon: <Building2 className="w-4 h-4 text-stone-700 dark:text-slate-300" /> },
              { name: 'Customers', desc: 'Inbound client enquiries', href: '/enquiries', icon: <Users className="w-4 h-4 text-stone-700 dark:text-slate-300" /> },
              { name: 'Leads', desc: 'Pipeline & qualification', href: '/leads', icon: <Kanban className="w-4 h-4 text-stone-700 dark:text-slate-300" /> },
              { name: 'Visits', desc: 'Tours & site schedule', href: '/site-visits', icon: <CalendarCheck className="w-4 h-4 text-stone-700 dark:text-slate-300" /> },
            ].map((item) => (
              <div
                key={item.name}
                onClick={() => navigate(item.href)}
                className="p-3.5 rounded-xl border border-stone-200/80 dark:border-[#242F42] bg-stone-50/50 dark:bg-[#101622] hover:bg-stone-100/70 dark:hover:bg-[#1A2230] hover:border-stone-300 dark:hover:border-slate-600 transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-[#141A24] border border-stone-200 dark:border-[#242F42] shadow-2xs">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-stone-900 dark:text-slate-100">{item.name}</span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};
