import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/auth.service';
import { AppShell } from '../components/layout/AppShell';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  ShieldCheck,
  Building,
  KeyRound,
  Database,
  CheckCircle2,
  Sparkles,
  Server,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
} from 'lucide-react';

export const AppOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [testResult, setTestResult] = useState<{
    endpoint: string;
    status: number | string;
    success: boolean;
    data?: any;
    error?: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const primaryRole = user?.roles?.[0] || 'AGENT';

  const runRoleTest = async (type: 'ADMIN' | 'EMPLOYEE' | 'AGENT' | 'SESSION') => {
    setIsTesting(true);
    setTestResult(null);

    try {
      let data: any;
      let endpoint = '';

      if (type === 'ADMIN') {
        endpoint = '/api/portal/admin-only';
        data = await authService.testAdminAccess();
      } else if (type === 'EMPLOYEE') {
        endpoint = '/api/portal/employee-access';
        data = await authService.testEmployeeAccess();
      } else if (type === 'AGENT') {
        endpoint = '/api/portal/agent-access';
        data = await authService.testAgentAccess();
      } else {
        endpoint = '/api/portal/session-check';
        data = await authService.testSessionCheck();
      }

      setTestResult({
        endpoint,
        status: 200,
        success: true,
        data,
      });

      showToast({
        variant: 'success',
        title: 'Backend Authorization Succeeded',
        message: `Status 200 OK for ${endpoint}`,
      });
    } catch (err: any) {
      setTestResult({
        endpoint: err.config?.url || `/api/portal/${type.toLowerCase()}`,
        status: err.status || 403,
        success: false,
        error: err.message || 'Access Denied: You do not possess the required role permission.',
      });

      showToast({
        variant: 'error',
        title: 'Backend Authorization Rejected (Expected RBAC)',
        message: `HTTP ${err.status || 403}: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 text-left">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-card border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-brand-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Phase 1 Verification Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                Welcome back, {user?.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                You are securely signed in to the <strong>SKYLINE CRM</strong> enterprise core.
                Authentication, session tokens, password hashing, and role-based permissions are active.
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
              <div className="text-xs text-slate-400 font-medium">Current Session Role:</div>
              <Badge role={primaryRole} size="md" />
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Profile & Role Security Test */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active User Profile & Session Claims (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                <User className="w-4.5 h-4.5 text-slate-700" />
                <h3>Authenticated Identity</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified Active
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name:
                </span>
                <span className="font-semibold text-slate-900">{user?.name}</span>
              </div>

              <div className="flex items-start justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Corporate Email:
                </span>
                <span className="font-mono text-[11px] text-slate-900">{user?.email}</span>
              </div>

              <div className="flex items-start justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Number:
                </span>
                <span className="text-slate-900 font-medium">{user?.phone}</span>
              </div>

              <div className="flex items-start justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Assigned Roles:
                </span>
                <div className="flex gap-1">
                  {user?.roles?.map((role) => (
                    <Badge key={role} role={role} size="sm" />
                  ))}
                </div>
              </div>

              <div className="flex items-start justify-between py-1.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> User ID:
                </span>
                <span className="font-mono text-[10px] text-slate-600 truncate max-w-[170px]">
                  {user?.id}
                </span>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Database className="w-3.5 h-3.5 text-slate-700" />
                <span>Enterprise Relational SQLite Core</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Passwords hashed with <strong>bcrypt (10 rounds)</strong>. Sessions authenticated via cryptographic JWTs with server-side validation and audit logging.
              </p>
            </div>
          </div>

          {/* Right: Live Backend RBAC Guard Tester (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                <Server className="w-4.5 h-4.5 text-brand-600" />
                <h3>Live Backend Role Guard Tester</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Real-time API Verification
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Test server-side authorization directly. Click any test below to dispatch an authenticated API request with your active Bearer token. The backend verifies your database role before returning data or rejecting with HTTP 403.
            </p>

            {/* Action Test Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Button
                variant={primaryRole === 'ADMIN' ? 'luxury' : 'outline'}
                size="sm"
                className="w-full flex-col py-3 h-auto text-left items-start"
                onClick={() => runRoleTest('ADMIN')}
                disabled={isTesting}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Admin Route</span>
                </div>
                <span className="text-[10px] opacity-75 mt-0.5">Requires ADMIN role</span>
              </Button>

              <Button
                variant={primaryRole === 'EMPLOYEE' || primaryRole === 'ADMIN' ? 'secondary' : 'outline'}
                size="sm"
                className="w-full flex-col py-3 h-auto text-left items-start"
                onClick={() => runRoleTest('EMPLOYEE')}
                disabled={isTesting}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Building className="w-3.5 h-3.5 text-blue-500" />
                  <span>Operations Route</span>
                </div>
                <span className="text-[10px] opacity-75 mt-0.5">ADMIN or EMPLOYEE</span>
              </Button>

              <Button
                variant={primaryRole === 'AGENT' || primaryRole === 'ADMIN' ? 'secondary' : 'outline'}
                size="sm"
                className="w-full flex-col py-3 h-auto text-left items-start"
                onClick={() => runRoleTest('AGENT')}
                disabled={isTesting}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Agent Route</span>
                </div>
                <span className="text-[10px] opacity-75 mt-0.5">ADMIN or AGENT</span>
              </Button>
            </div>

            {/* Live Response Panel */}
            {testResult && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">HTTP Response:</span>
                  <span
                    className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    HTTP {testResult.status} {testResult.success ? 'OK' : 'FORBIDDEN'}
                  </span>
                </div>

                <div
                  className={`p-3.5 rounded-lg border text-xs font-mono overflow-x-auto ${
                    testResult.success
                      ? 'bg-slate-900 text-emerald-400 border-slate-800'
                      : 'bg-slate-950 text-rose-400 border-rose-900/40'
                  }`}
                >
                  <div className="text-[11px] text-slate-400 mb-1 pb-1 border-b border-slate-800">
                    Endpoint: {testResult.endpoint}
                  </div>
                  <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">
                    {testResult.success
                      ? JSON.stringify(testResult.data, null, 2)
                      : JSON.stringify({ error: testResult.error, status: testResult.status }, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phase 2 Architecture Ready Banner */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Layers className="w-4 h-4 text-brand-600" />
              <h3>CRM Domain Scalability Foundation (Phase 2+ Readiness)</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Database schema prepared for direct extension
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {[
              { name: 'Enquiries & Leads', desc: 'Score & stages', status: 'Ready' },
              { name: 'Customers & KYC', desc: 'Investor profiles', status: 'Ready' },
              { name: 'Properties', desc: 'Inventory catalog', status: 'Ready' },
              { name: 'Site Visits', desc: 'Calendar & dispatch', status: 'Ready' },
              { name: 'Sales & Deals', desc: 'Booking contracts', status: 'Ready' },
              { name: 'Payments & Ledgers', desc: 'Receipts & audits', status: 'Ready' },
            ].map((mod) => (
              <div key={mod.name} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-left">
                <div className="text-xs font-bold text-slate-900">{mod.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{mod.desc}</div>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200/60">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{mod.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};
