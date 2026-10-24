import React, { useState } from 'react';
import { Users, UserPlus, Edit, Trash2, Shield, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

export const DisplayUser = ({ onNavigateToCreate, onSelectUserToEdit }) => {
  const { users, removeUser, updateUser } = useAuth();
  const { addToast } = useToast();

  const [deletingId, setDeletingId] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const handleDelete = () => {
    if (deletingId) {
      removeUser(deletingId);
      addToast('User deleted from Skyline CRM directory.', 'info');
      setDeletingId(null);
    }
  };

  const columns = [
    {
      header: 'User ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs font-bold text-slate-500',
      width: '100px'
    },
    {
      header: 'Full Name & Username',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.firstName} {row.lastName}</div>
          <div className="text-xs font-mono text-brand-600">@{row.username}</div>
        </div>
      )
    },
    {
      header: 'Role',
      render: (row) => <Badge>{row.role}</Badge>
    },
    {
      header: 'Contact Info',
      render: (row) => (
        <div className="text-xs">
          <div className="text-slate-800">{row.email}</div>
          <div className="text-slate-400">{row.phone}</div>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department',
      cellClassName: 'text-xs text-slate-700'
    },
    {
      header: 'Status',
      render: (row) => <Badge>{row.status}</Badge>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingUser(row)}
            className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            View
          </button>
          <button
            onClick={() => onSelectUserToEdit && onSelectUserToEdit(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit User"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            disabled={row.username === 'admin'}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Remove User"
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
        title="Display User Directory"
        subtitle="Active user accounts, assigned system roles, access statuses and contact details."
        breadcrumbs={['Skyline CRM', 'User Management', 'Display User']}
        actions={
          <button
            onClick={onNavigateToCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        }
      />

      <DataTable
        title="User-Directory-Report"
        columns={columns}
        data={users}
        searchPlaceholder="Search name, username, email, department..."
        filterKey="role"
        filterOptions={['Admin', 'Employee', 'Agent']}
      />

      {/* User Card Modal */}
      {viewingUser && (
        <Modal
          isOpen={Boolean(viewingUser)}
          onClose={() => setViewingUser(null)}
          title={`User Profile: @${viewingUser.username}`}
          subtitle={`${viewingUser.firstName} ${viewingUser.lastName}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold">User Role:</span>
                <p className="mt-0.5"><Badge>{viewingUser.role}</Badge></p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Department:</span>
                <p className="text-slate-900 font-bold mt-0.5">{viewingUser.department}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Email:</span>
                <p className="text-slate-900 font-bold mt-0.5">{viewingUser.email}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Phone:</span>
                <p className="text-slate-900 font-bold mt-0.5">{viewingUser.phone}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Account Status:</span>
                <p className="mt-0.5"><Badge>{viewingUser.status}</Badge></p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Created Date:</span>
                <p className="text-slate-700 font-medium mt-0.5">{viewingUser.createdAt}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete User Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Remove User Account"
        message="Are you sure you want to permanently revoke access and remove this user from Skyline CRM?"
      />
    </div>
  );
};
