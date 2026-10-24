import React, { useState } from 'react';
import { UserX, Trash2, AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { PageHeader } from '../../../components/common/PageHeader';
import { Badge } from '../../../components/common/Badge';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

export const RemoveUser = ({ onUserRemoved }) => {
  const { users, removeUser, updateUser } = useAuth();
  const { addToast } = useToast();

  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = () => {
    if (deletingId) {
      const target = users.find((u) => u.id === deletingId);
      removeUser(deletingId);
      addToast(`User ${target?.firstName || ''} ${target?.lastName || ''} removed from Skyline CRM.`, 'info');
      setDeletingId(null);
      if (onUserRemoved) onUserRemoved();
    }
  };

  const handleToggleSuspend = (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    updateUser(user.id, { status: newStatus });
    addToast(`User status changed to ${newStatus}.`, 'info');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Remove / Suspend User"
        subtitle="Revoke credentials, terminate access sessions, and manage deactivated profiles."
        breadcrumbs={['Skyline CRM', 'User Management', 'Remove User']}
      />

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-800">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Administrative Security Protocol:</span>
          <span>
            Removing a user immediately revokes portal access. Primary Superadmin account cannot be removed. You can also temporarily suspend an account rather than permanent removal.
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div className="divide-y divide-slate-100">
          {users.map((user) => {
            const isProtectedAdmin = user.username === 'admin';
            return (
              <div
                key={user.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm">
                    {user.firstName?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {user.firstName} {user.lastName}
                      </span>
                      <Badge>{user.role}</Badge>
                      <Badge>{user.status}</Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      @{user.username} • {user.email} • {user.department}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {!isProtectedAdmin ? (
                    <>
                      <button
                        onClick={() => handleToggleSuspend(user)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          user.status === 'Active'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {user.status === 'Active' ? 'Suspend Access' : 'Reactivate'}
                      </button>

                      <button
                        onClick={() => setDeletingId(user.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 italic bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                      System Protected Admin
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Permanently Remove User Account"
        message="Are you certain you wish to delete this user from the system? All assigned records will remain archived."
      />
    </div>
  );
};
