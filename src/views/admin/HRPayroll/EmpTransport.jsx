import React, { useState } from 'react';
import {
  Bus,
  Plus,
  Phone,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Trash2,
  Edit,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';
import { PageHeader } from '../../../components/common/PageHeader';
import { Modal } from '../../../components/common/Modal';

export const EmpTransport = () => {
  const { transportRoutes, addTransportRoute, updateTransportRoute, deleteTransportRoute, employees } = useData();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const initialForm = {
    routeNo: 'Route-03 (West Suburbs to Skyline Complex)',
    vehicleType: '14-Seater AC Shuttle',
    vehicleNumber: 'MH-12-EF-1234',
    driverName: 'Santosh Jadhav',
    driverPhone: '+91 98220 55443',
    pickupPoints: 'West Gate -> Highway Flyover -> Skyline Tower',
    assignedEmployees: ['Sarah Jenkins', 'Devon Miller'],
    morningTiming: '08:30 AM',
    eveningTiming: '06:30 PM',
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (route) => {
    setEditingRoute(route);
    setFormData({ ...route });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.routeNo.trim() || !formData.driverName.trim()) {
      addToast('Please provide route number and driver name.', 'error');
      return;
    }

    if (editingRoute) {
      updateTransportRoute(editingRoute.id, formData);
      addToast(`Transport route updated: ${formData.routeNo}`, 'success');
    } else {
      addTransportRoute(formData);
      addToast(`Transport route added: ${formData.routeNo}`, 'success');
    }

    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Route Identification',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.routeNo}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-brand-600" />
            <span>{row.pickupPoints}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Vehicle Details',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.vehicleType}</div>
          <div className="text-xs font-mono font-bold text-slate-600">{row.vehicleNumber}</div>
        </div>
      )
    },
    {
      header: 'Driver & Contact',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs">{row.driverName}</div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{row.driverPhone}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Timings',
      render: (row) => (
        <div className="text-xs">
          <div>Morning: <strong className="text-slate-800">{row.morningTiming}</strong></div>
          <div>Evening: <strong className="text-slate-800">{row.eveningTiming}</strong></div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'default'}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded"
            title="Edit Route"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              deleteTransportRoute(row.id);
              addToast('Transport route removed.', 'info');
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
            title="Delete Route"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Transport & Commute Routes"
        subtitle="Manage daily corporate shuttle routes, dedicated site commute vans, driver details, and pick-up stop schedules."
        breadcrumbs={['Skyline CRM', 'HR & Payroll', 'Emp Transport']}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Commute Route</span>
          </button>
        }
      />

      <DataTable
        title="Employee-Transport-Routes-Directory"
        columns={columns}
        data={transportRoutes}
        searchPlaceholder="Search route, driver name, vehicle number..."
        filterKey="status"
        filterOptions={['Active', 'Maintenance']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoute ? 'Edit Transport Route' : 'Add Corporate Commute Route'}
        subtitle="Set vehicle type, driver credentials, pickup route, and morning/evening timings."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Route Name & Number *</label>
            <input
              type="text"
              required
              value={formData.routeNo}
              onChange={(e) => setFormData({ ...formData, routeNo: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type *</label>
              <input
                type="text"
                required
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                placeholder="e.g. 14-Seater AC Shuttle"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Plate Number *</label>
              <input
                type="text"
                required
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                placeholder="MH-12-AB-4455"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Driver Full Name *</label>
              <input
                type="text"
                required
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Driver Phone Contact *</label>
              <input
                type="tel"
                required
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Route & Stops</label>
            <input
              type="text"
              value={formData.pickupPoints}
              onChange={(e) => setFormData({ ...formData, pickupPoints: e.target.value })}
              placeholder="e.g. Metro Station -> Commercial Hub -> Sector 4 Complex"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Morning Pickup Time</label>
              <input
                type="text"
                value={formData.morningTiming}
                onChange={(e) => setFormData({ ...formData, morningTiming: e.target.value })}
                placeholder="08:30 AM"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Evening Return Time</label>
              <input
                type="text"
                value={formData.eveningTiming}
                onChange={(e) => setFormData({ ...formData, eveningTiming: e.target.value })}
                placeholder="06:30 PM"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg"
            >
              {editingRoute ? 'Update Route' : 'Save Transport Route'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
