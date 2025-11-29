import { useState, useEffect } from 'react';
import { promoCodes } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { Ticket, Plus, Edit, Trash2, Copy } from 'lucide-react';

export default function PromoCodes() {
  const [promoList, setPromoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '', message: '', discountType: 'percentage', discountValue: '', maxDiscountAmount: '',
    minimumOrderAmount: '', startDate: '', endDate: '', maxUsers: '', maxUsagePerUser: 1,
    isCashback: false, isListed: true, isActive: true
  });

  useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const res = await promoCodes.list();
      setPromoList(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        minimumOrderAmount: parseFloat(formData.minimumOrderAmount) || 0,
        maxUsers: formData.maxUsers ? parseInt(formData.maxUsers) : null,
        maxUsagePerUser: parseInt(formData.maxUsagePerUser) || 1
      };
      if (editingPromo) {
        await promoCodes.update(editingPromo._id, data);
      } else {
        await promoCodes.create(data);
      }
      setShowModal(false);
      resetForm();
      fetchPromos();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this promo code?')) {
      await promoCodes.delete(id);
      fetchPromos();
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Code copied!');
  };

  const resetForm = () => {
    setFormData({
      code: '', message: '', discountType: 'percentage', discountValue: '', maxDiscountAmount: '',
      minimumOrderAmount: '', startDate: '', endDate: '', maxUsers: '', maxUsagePerUser: 1,
      isCashback: false, isListed: true, isActive: true
    });
    setEditingPromo(null);
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code, message: promo.message || '', discountType: promo.discountType,
      discountValue: promo.discountValue, maxDiscountAmount: promo.maxDiscountAmount || '',
      minimumOrderAmount: promo.minimumOrderAmount || '',
      startDate: promo.startDate?.split('T')[0] || '', endDate: promo.endDate?.split('T')[0] || '',
      maxUsers: promo.maxUsers || '', maxUsagePerUser: promo.maxUsagePerUser || 1,
      isCashback: promo.isCashback, isListed: promo.isListed, isActive: promo.isActive
    });
    setShowModal(true);
  };

  const columns = [
    { key: 'code', label: 'Code', render: (val) => (
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-blue-600">{val}</span>
        <button onClick={() => copyCode(val)} className="btn-icon"><Copy size={14} /></button>
      </div>
    )},
    { key: 'discountType', label: 'Discount', render: (_, row) => (
      <span>{row.discountType === 'percentage' ? `${row.discountValue}%` : `$${row.discountValue}`}</span>
    )},
    { key: 'usageCount', label: 'Used', render: (val, row) => `${val || 0}${row.maxUsers ? `/${row.maxUsers}` : ''}` },
    { key: 'endDate', label: 'Expires', render: (val) => val ? new Date(val).toLocaleDateString() : 'Never' },
    { key: 'isCashback', label: 'Type', render: (val) => <span className={`badge ${val ? 'badge-info' : 'badge-secondary'}`}>{val ? 'Cashback' : 'Discount'}</span> },
    { key: 'isActive', label: 'Status', render: (val) => <span className={`badge ${val ? 'badge-success' : 'badge-danger'}`}>{val ? 'Active' : 'Inactive'}</span> },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => openEditModal(row)} className="btn-icon"><Edit size={16} /></button>
        <button onClick={() => handleDelete(row._id)} className="btn-icon text-red-500"><Trash2 size={16} /></button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Ticket /> Promo Codes</h1>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus size={16} /> Add Promo Code</Button>
      </div>
      <Card><Table columns={columns} data={promoList} loading={loading} /></Card>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPromo ? 'Edit Promo Code' : 'Add Promo Code'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required />
            <select className="input" value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <Input label="Message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Discount Value" type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} required />
            <Input label="Max Discount Amount" type="number" value={formData.maxDiscountAmount} onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })} />
            <Input label="Min Order Amount" type="number" value={formData.minimumOrderAmount} onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
            <Input label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Users" type="number" value={formData.maxUsers} onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })} placeholder="Unlimited" />
            <Input label="Max Usage Per User" type="number" value={formData.maxUsagePerUser} onChange={(e) => setFormData({ ...formData, maxUsagePerUser: e.target.value })} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isCashback} onChange={(e) => setFormData({ ...formData, isCashback: e.target.checked })} /> Cashback</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isListed} onChange={(e) => setFormData({ ...formData, isListed: e.target.checked })} /> Show in List</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} /> Active</label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editingPromo ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
