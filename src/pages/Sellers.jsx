import { useState, useEffect } from 'react';
import { sellers, users, stores } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { Store, Plus, Edit, Trash2, CheckCircle, DollarSign, Eye } from 'lucide-react';

export default function Sellers() {
  const [sellerList, setSellerList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [fundData, setFundData] = useState({ amount: '', type: 'credit', message: '' });
  const [formData, setFormData] = useState({
    userId: '', storeId: '', businessName: '', businessType: 'individual', phone: '',
    gstNumber: '', panNumber: '', defaultCommission: 10, isActive: true
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sellersRes, usersRes, storesRes, statsRes] = await Promise.all([
        sellers.list(),
        users.list({ limit: 100 }),
        stores.list({ limit: 100 }),
        sellers.getStats()
      ]);
      setSellerList(sellersRes.data.data || []);
      setUserList(usersRes.data.data || []);
      setStoreList(storesRes.data.data || []);
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
      const data = { ...formData, defaultCommission: parseFloat(formData.defaultCommission) };
      if (editingSeller) {
        await sellers.update(editingSeller._id, data);
      } else {
        await sellers.create(data);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleVerify = async (id) => {
    if (window.confirm('Verify this seller?')) {
      await sellers.verify(id);
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deactivate this seller?')) {
      await sellers.delete(id);
      fetchData();
    }
  };

  const handleFundTransfer = async (e) => {
    e.preventDefault();
    try {
      await sellers.fundTransfer({
        sellerId: selectedSeller._id,
        amount: parseFloat(fundData.amount),
        type: fundData.type,
        message: fundData.message
      });
      setShowFundModal(false);
      setFundData({ amount: '', type: 'credit', message: '' });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({ userId: '', storeId: '', businessName: '', businessType: 'individual', phone: '', gstNumber: '', panNumber: '', defaultCommission: 10, isActive: true });
    setEditingSeller(null);
  };

  const openEditModal = (seller) => {
    setEditingSeller(seller);
    setFormData({
      userId: seller.user?._id || '', storeId: seller.store?._id || '', businessName: seller.businessName,
      businessType: seller.businessType, phone: seller.phone, gstNumber: seller.gstNumber || '',
      panNumber: seller.panNumber || '', defaultCommission: seller.defaultCommission, isActive: seller.isActive
    });
    setShowModal(true);
  };

  const columns = [
    { key: 'businessName', label: 'Business', render: (val, row) => (
      <div>
        <div className="font-medium">{val}</div>
        <div className="text-sm text-gray-500">{row.user?.email}</div>
      </div>
    )},
    { key: 'store', label: 'Store', render: (val) => val?.name || '-' },
    { key: 'walletBalance', label: 'Balance', render: (val) => <span className="font-medium">${(val || 0).toFixed(2)}</span> },
    { key: 'totalOrders', label: 'Orders', render: (val) => val || 0 },
    { key: 'defaultCommission', label: 'Commission', render: (val) => `${val}%` },
    { key: 'isVerified', label: 'Status', render: (val, row) => (
      <div className="flex gap-1">
        <span className={`badge ${val ? 'badge-success' : 'badge-warning'}`}>{val ? 'Verified' : 'Pending'}</span>
        {!row.isActive && <span className="badge badge-danger">Inactive</span>}
      </div>
    )},
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        {!row.isVerified && <button onClick={() => handleVerify(row._id)} className="btn-icon text-green-500" title="Verify"><CheckCircle size={16} /></button>}
        <button onClick={() => { setSelectedSeller(row); setShowFundModal(true); }} className="btn-icon text-blue-500" title="Fund"><DollarSign size={16} /></button>
        <button onClick={() => openEditModal(row)} className="btn-icon"><Edit size={16} /></button>
        <button onClick={() => handleDelete(row._id)} className="btn-icon text-red-500"><Trash2 size={16} /></button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Store /> Sellers</h1>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus size={16} /> Add Seller</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center"><div className="text-2xl font-bold">{stats.totalSellers || 0}</div><div className="text-gray-500">Total Sellers</div></Card>
        <Card className="text-center"><div className="text-2xl font-bold text-green-500">{stats.verifiedSellers || 0}</div><div className="text-gray-500">Verified</div></Card>
        <Card className="text-center"><div className="text-2xl font-bold text-yellow-500">{stats.pendingVerification || 0}</div><div className="text-gray-500">Pending</div></Card>
        <Card className="text-center"><div className="text-2xl font-bold text-blue-500">${(stats.totalEarnings || 0).toFixed(2)}</div><div className="text-gray-500">Total Earnings</div></Card>
      </div>

      <Card><Table columns={columns} data={sellerList} loading={loading} /></Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSeller ? 'Edit Seller' : 'Add Seller'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingSeller && (
            <>
              <select className="input w-full" value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} required>
                <option value="">Select User</option>
                {userList.map(u => <option key={u._id} value={u._id}>{u.email} - {u.userFirstName}</option>)}
              </select>
              <select className="input w-full" value={formData.storeId} onChange={(e) => setFormData({ ...formData, storeId: e.target.value })} required>
                <option value="">Select Store</option>
                {storeList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </>
          )}
          <Input label="Business Name" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <select className="input" value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}>
              <option value="individual">Individual</option>
              <option value="company">Company</option>
              <option value="partnership">Partnership</option>
            </select>
            <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="GST Number" value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} />
            <Input label="PAN Number" value={formData.panNumber} onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })} />
          </div>
          <Input label="Default Commission %" type="number" value={formData.defaultCommission} onChange={(e) => setFormData({ ...formData, defaultCommission: e.target.value })} />
          <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} /> Active</label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editingSeller ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showFundModal} onClose={() => setShowFundModal(false)} title="Fund Transfer">
        <form onSubmit={handleFundTransfer} className="space-y-4">
          <p>Transfer funds to: <strong>{selectedSeller?.businessName}</strong></p>
          <p>Current Balance: <strong>${(selectedSeller?.walletBalance || 0).toFixed(2)}</strong></p>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount" type="number" step="0.01" value={fundData.amount} onChange={(e) => setFundData({ ...fundData, amount: e.target.value })} required />
            <select className="input" value={fundData.type} onChange={(e) => setFundData({ ...fundData, type: e.target.value })}>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>
          <Input label="Message" value={fundData.message} onChange={(e) => setFundData({ ...fundData, message: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowFundModal(false)}>Cancel</Button>
            <Button type="submit">Transfer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
