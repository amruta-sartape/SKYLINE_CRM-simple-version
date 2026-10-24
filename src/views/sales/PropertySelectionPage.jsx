import React, { useState } from 'react';
import {
  Plus, Eye, Edit, Trash2, Building, Home, CheckCircle2, XCircle,
  Maximize2, DollarSign, Car, Sparkles, Filter, Layers
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const PropertySelectionPage = () => {
  const { properties, addProperty, updateProperty, deleteProperty } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    unitNumber: '',
    floor: '5th Floor',
    wing: 'Wing A (Sunrise)',
    configuration: '2 BHK',
    carpetArea: '850 sq ft',
    builtUpArea: '1,100 sq ft',
    price: 360000,
    parking: '1 Covered Spot',
    amenities: 'Clubhouse, Swimming Pool, Gym',
    availability: 'Available'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.unitNumber.trim()) {
      addToast('Please enter Unit Number.', 'error');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price) || 0
    };

    if (editingProperty) {
      updateProperty(editingProperty.id, payload);
      addToast(`Property ${editingProperty.unitNumber} updated successfully.`, 'success');
      setEditingProperty(null);
    } else {
      const created = addProperty(payload);
      addToast(`New property unit ${created.unitNumber} added to inventory.`, 'success');
      setIsAddModalOpen(false);
    }

    setFormData({
      unitNumber: '',
      floor: '5th Floor',
      wing: 'Wing A (Sunrise)',
      configuration: '2 BHK',
      carpetArea: '850 sq ft',
      builtUpArea: '1,100 sq ft',
      price: 360000,
      parking: '1 Covered Spot',
      amenities: 'Clubhouse, Swimming Pool, Gym',
      availability: 'Available'
    });
  };

  const openEditModal = (item) => {
    setEditingProperty(item);
    setFormData({ ...item });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteProperty(deletingId);
      addToast('Property unit removed from inventory.', 'info');
      setDeletingId(null);
    }
  };

  const columns = [
    {
      header: 'Unit Code',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-brand-600" />
            {row.unitNumber}
          </div>
          <div className="text-[10px] text-slate-500">{row.floor} • {row.wing}</div>
        </div>
      )
    },
    {
      header: 'Configuration',
      render: (row) => (
        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
          {row.configuration}
        </span>
      )
    },
    {
      header: 'Areas (Carpet / Built-up)',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">Carpet: {row.carpetArea}</div>
          <div className="text-[10px] text-slate-500">Built-up: {row.builtUpArea}</div>
        </div>
      )
    },
    {
      header: 'List Price',
      render: (row) => (
        <div className="font-extrabold text-emerald-700 text-xs">
          ${(Number(row.price) || 0).toLocaleString()}
        </div>
      )
    },
    {
      header: 'Parking & Amenities',
      render: (row) => (
        <div className="max-w-[200px]">
          <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
            <Car className="w-3 h-3 text-slate-400" />
            {row.parking}
          </div>
          <div className="text-[10px] text-slate-400 truncate" title={row.amenities}>
            {row.amenities}
          </div>
        </div>
      )
    },
    {
      header: 'Availability',
      render: (row) => (
        <Badge variant={row.availability === 'Available' ? 'success' : 'danger'}>
          {row.availability}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingProperty(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="View Specifications"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit Unit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Unit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const totalInventory = properties.length;
  const availableCount = properties.filter(p => p.availability === 'Available').length;
  const soldCount = properties.filter(p => p.availability === 'Sold').length;
  const totalValue = properties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Property Selection & Unit Inventory"
        description="Master unit master registry across 1 BHK, 2 BHK, 3 BHK, and 4 BHK layouts."
        breadcrumbs={[
          { label: 'Sales & Leads' },
          { label: 'Property Selection', active: true }
        ]}
        actions={
          <button
            onClick={() => {
              setFormData({
                unitNumber: '',
                floor: '5th Floor',
                wing: 'Wing A (Sunrise)',
                configuration: '2 BHK',
                carpetArea: '850 sq ft',
                builtUpArea: '1,100 sq ft',
                price: 360000,
                parking: '1 Covered Spot',
                amenities: 'Clubhouse, Swimming Pool, Gym',
                availability: 'Available'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Property Unit
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Units</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalInventory} Units</div>
          <div className="text-[11px] text-slate-400 mt-1">Catalogued in development</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Available Units</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{availableCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Ready for client booking</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Sold Out Units</div>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">{soldCount}</div>
          <div className="text-[11px] text-rose-600 mt-1">Confirmed purchase deeds</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Total Portfolio Value</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">${(totalValue / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-blue-600 mt-1">Aggregate inventory list price</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Unit Selection Directory"
        subtitle="Filter by BHK configuration, floor level, and real-time inventory status"
        data={properties}
        columns={columns}
        searchPlaceholder="Search unit number, wing, or configuration..."
        filterKey="configuration"
        filterOptions={[
          { label: 'All Configurations', value: 'ALL' },
          { label: '1 BHK', value: '1 BHK' },
          { label: '2 BHK', value: '2 BHK' },
          { label: '3 BHK', value: '3 BHK' },
          { label: '4 BHK', value: '4 BHK' }
        ]}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingProperty}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProperty(null);
        }}
        title={editingProperty ? `Edit Unit: ${editingProperty.unitNumber}` : 'Add New Property Unit'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit Number *</label>
              <input
                type="text"
                required
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Unit 504"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Configuration</label>
              <select
                value={formData.configuration}
                onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Floor</label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. 5th Floor"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Wing / Tower</label>
              <input
                type="text"
                value={formData.wing}
                onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Wing A (Sunrise)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Carpet Area</label>
              <input
                type="text"
                value={formData.carpetArea}
                onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. 850 sq ft"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Built-up Area</label>
              <input
                type="text"
                value={formData.builtUpArea}
                onChange={(e) => setFormData({ ...formData, builtUpArea: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. 1,100 sq ft"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price ($ USD)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. 350000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Parking Allocation</label>
              <input
                type="text"
                value={formData.parking}
                onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                placeholder="e.g. 1 Covered Spot"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Availability</label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amenities</label>
            <textarea
              rows={2}
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="e.g. Clubhouse, Pool, Gym, Smart Home Automation"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingProperty(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              {editingProperty ? 'Update Unit' : 'Save Unit to Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingProperty && (
        <Modal
          isOpen={true}
          onClose={() => setViewingProperty(null)}
          title={`Unit Specifications: ${viewingProperty.unitNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-brand-600" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{viewingProperty.unitNumber}</div>
                  <div className="text-[11px] text-slate-500">{viewingProperty.floor} • {viewingProperty.wing}</div>
                </div>
              </div>
              <Badge variant={viewingProperty.availability === 'Available' ? 'success' : 'danger'}>
                {viewingProperty.availability}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Configuration</span>
                <p className="font-bold text-brand-700 mt-0.5">{viewingProperty.configuration}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Listing Price</span>
                <p className="font-bold text-emerald-700 mt-0.5">${Number(viewingProperty.price).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Carpet Area</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingProperty.carpetArea}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Super Built-up Area</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingProperty.builtUpArea}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Parking Space</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingProperty.parking}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500">Included Amenities & Highlights</span>
              <p className="text-slate-800 mt-1 leading-relaxed">{viewingProperty.amenities}</p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingProperty(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Remove Unit from Inventory"
        message="Are you sure you want to remove this property unit from the active inventory database?"
      />
    </div>
  );
};
