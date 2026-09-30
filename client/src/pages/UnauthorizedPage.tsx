import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SkylineBrand } from '../components/auth/SkylineBrand';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    requiredRoles?: string[];
    userRoles?: string[];
    attemptedPath?: string;
  } | null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 bg-skyline-architecture">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6 animate-slide-up">
        <SkylineBrand variant="light" size="md" className="mx-auto" />

        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
            HTTP 403 • Access Restricted
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
            Unauthorized Role Level
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Your current account does not have sufficient role privileges to access this area of SKYLINE CRM.
          </p>
        </div>

        {/* Diagnostic Role Matrix */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/90 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Signed In Account:</span>
            <span className="font-semibold text-slate-200">{user?.name} ({user?.email})</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Your Active Role:</span>
            <div className="flex gap-1.5">
              {user?.roles?.map((r) => (
                <Badge key={r} role={r} size="sm" />
              ))}
            </div>
          </div>

          {state?.requiredRoles && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Required Role(s):</span>
              <div className="flex gap-1.5">
                {state.requiredRoles.map((r) => (
                  <Badge key={r} role={r} size="sm" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            className="w-full text-slate-300 border-slate-700 hover:bg-slate-800"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Return to Overview
          </Button>

          <Button
            variant="primary"
            size="md"
            className="w-full bg-brand-600 hover:bg-brand-500 text-white border-brand-500"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Switch Account
          </Button>
        </div>
      </div>
    </div>
  );
};
