import { useState, useEffect } from 'react';
import { affiliates, users } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { Users, Plus, Edit, Trash2, CheckCircle, DollarSign, MousePointer } from 'lucide-react';

export default function Affiliates() {
  const [affiliateList, setAffiliateList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCommissionsModal, setShowCommissionsModal] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState(null);
  const [formData, setFormData] = useState({
    userId: '', name: '', email: '', phone: '', website: '',
    commissionType: 'percentage', commissionRate: 5, isActive: true
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [affRes, usersRes, statsRes] = await Promise.all([
        affiliates.list(),
        users.list({ limit: 100 }),
        affiliates.getStats()
      ]);
      setAffiliateList(affRes.data.data || []);
      setUserList(usersRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, commissionRate: parseFloat(formData.commissionRate) };
      if (editingAffiliate) {
        await affiliates.update(editingAffiliate._id, data);
      } else {
        await affiliates.create(data);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleVerify = async (id) => {
    if (window.confirm('Verify this affiliate?')) {
      await affiliates.verify(id);
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deactivate this affiliate?')) {
      await affiliates.delete(id);
      fetchData();
    }
  };

  const viewCommissions = async (affiliate) => {
    try {
      const res = await affiliates.listCommissions({ affiliateId: affiliate._id });
      setCommissions(res.data.data || []);
      setShowCommissionsModal(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const settleCommission = async (id) => {
    try {
      await affiliates.settleCommission(id);
      const res = await affiliates.listCommissions({ affiliateId: commissions[0]?.affiliate?._id });
      setCommissions(res.data.data || []);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({ userId: '', name: '', email: '', phone: '', website: '', commissionType: 'percentage', commissionRate: 5, isActive: true });
    setEditingAffiliate(null);
  };

  const openEditModal = (aff) => {
    setEditingAffiliate(aff);
    setFormData({
      userId: aff.user?._id || '', name: aff.name, email: aff.email, phone: aff.phone || '',
      website: aff.website || '', commissionType: aff.commissionType, commissionRate: aff.commissionRate, isActive: aff.isActive
    });
    setShowModal(true);
  };

  const columns = [
    { key: 'name', label: 'Affiliate', render: (val, row) => (
      <div>
        <div className="font-medium">{val}</div>
        <div className="text-sm text-gray-500">{row.affiliateCode}</div>
      </div>
    )},
    { key: 'email', label: 'Email' },
    { key: 'commissionRate', label: 'Commission', render: (val, row) => `${val}${row.commissionType === 'percentage' ? '%' : ' fixed'}` },
    { key: 'totalClicks', label: 'Clicks', render: (val) => val || 0 },
    { key: 'totalOrders', label: 'Orders', render: (val) => val || 0 },
    { key: 'walletBalance', label: 'Balance', render: (val) => `$${(val || 0).toFixed(2)}` },
    { key: 'isVerified', label: 'Status', render: (val, row) => (
      <div className="flex gap-1">
        <span className={`badge ${val ? 'badge-success' : 'badge-warning'}`}>{val ? 'Verified' : 'Pending'}</span>
      </div>
    )},
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        {!row.isVerified && <button onClick={() => handleVerify(row._id)} className="btn-icon text-green-500"><CheckCircle size={16} /></button>}
        <button onClick={() => viewCommissions(row)} className="btn-icon text-blue-500"><DollarSign size={16} /></button>
        <button onClick={() => openEditModal(row)} className="btn-icon"><Edit size={16} /></button>
        <button onClick={() => handleDelete(row._id)} className="btn-icon text-red-500"><Trash2 size={16} /></button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users /> Affiliates</h1>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus size={16} /> Add Affiliate</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center"><div className="text-2xl font-bold">{stats.totalAffiliates || 0}</div><div className="text-gray-500">Total Affiliates</div></Card>
        <Card className="text-center"><div className="text-2xl font-bold text-blue-500">{stats.totalClicks || 0}</div><div className="text-gray-500">Total Clicks</div></Card>
        <Card className="text-center"><div className="text-2xl font-bold text-green-500">{stats.conversionRate || 0}%</div><div className="text-gray-500">Conversion Rate</div></Card>
        <Card className="text-center"><div className="text-2xl font-bold text-purple-500">${(stats.totalEarnings || 0).toFixed(2)}</div><div className="text-gray-500">Total Earnings</div></Card>
      </div>

      <Card><Table columns={columns} data={affiliateList} loading={loading} /></Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingAffiliate ? 'Edit Affiliate' : 'Add Affiliate'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingAffiliate && (
            <select className="input w-full" value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} required>
              <option value="">Select User</option>
              {userList.map(u => <option key={u._id} value={u._id}>{u.email} - {u.userFirstName}</option>)}
            </select>
          )}
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <Input label="Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <select className="input" value={formData.commissionType} onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <Input label="Commission Rate" type="number" value={formData.commissionRate} onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })} />
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} /> Active</label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editingAffiliate ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showCommissionsModal} onClose={() => setShowCommissionsModal(false)} title="Affiliate Commissions" size="lg">
        <div className="space-y-4">
          {commissions.length === 0 ? (
            <p className="text-center text-gray-500">No commissions found</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Order</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Commission</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c._id} className="border-b">
                    <td className="p-2">${c.orderAmount?.toFixed(2)}</td>
                    <td className="p-2">{c.commissionRate}{c.commissionType === 'percentage' ? '%' : ''}</td>
                    <td className="p-2">${c.commissionAmount?.toFixed(2)}</td>
                    <td className="p-2"><span className={`badge badge-${c.status === 'settled' ? 'success' : c.status === 'approved' ? 'info' : 'warning'}`}>{c.status}</span></td>
                    <td className="p-2">
                      {c.status === 'approved' && (
                        <Button size="sm" onClick={() => settleCommission(c._id)}>Settle</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>
    </div>
  );
}
