import { useState, useEffect } from 'react';
import { returns } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { RotateCcw, Eye, Edit } from 'lucide-react';

export default function Returns() {
  const [returnList, setReturnList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [filter, setFilter] = useState('');
  const [formData, setFormData] = useState({ status: '', refundAmount: '', adminNotes: '' });

  useEffect(() => { fetchReturns(); }, [filter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await returns.list({ status_filter: filter });
      setReturnList(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await returns.update(selectedReturn._id, {
        status: formData.status,
        refundAmount: parseFloat(formData.refundAmount) || 0,
        adminNotes: formData.adminNotes
      });
      setShowModal(false);
      fetchReturns();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = (ret) => {
    setSelectedReturn(ret);
    setFormData({
      status: ret.status,
      refundAmount: ret.refundAmount || '',
      adminNotes: ret.adminNotes || ''
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'badge-warning', approved: 'badge-info', rejected: 'badge-danger',
      pickup_scheduled: 'badge-info', picked_up: 'badge-info', received: 'badge-success',
      refunded: 'badge-success', cancelled: 'badge-secondary'
    };
    return colors[status] || 'badge-secondary';
  };

  const columns = [
    { key: 'order', label: 'Order', render: (val) => <span className="font-mono text-sm">{val?._id?.slice(-8) || '-'}</span> },
    { key: 'user', label: 'Customer', render: (val) => (
      <div>
        <div>{val?.userFirstName} {val?.userLastName}</div>
        <div className="text-sm text-gray-500">{val?.email}</div>
      </div>
    )},
    { key: 'reason', label: 'Reason', render: (val) => <span className="truncate max-w-[200px] block">{val}</span> },
    { key: 'refundAmount', label: 'Refund', render: (val) => val ? `$${val.toFixed(2)}` : '-' },
    { key: 'status', label: 'Status', render: (val) => <span className={`badge ${getStatusColor(val)}`}>{val?.replace('_', ' ')}</span> },
    { key: 'createdAt', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <button onClick={() => openModal(row)} className="btn-icon"><Edit size={16} /></button>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><RotateCcw /> Return Requests</h1>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pickup_scheduled">Pickup Scheduled</option>
            <option value="picked_up">Picked Up</option>
            <option value="received">Received</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <Table columns={columns} data={returnList} loading={loading} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Update Return Request">
        <form onSubmit={handleUpdate} className="space-y-4">
          {selectedReturn && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p><strong>Reason:</strong> {selectedReturn.reason}</p>
              <p><strong>Description:</strong> {selectedReturn.description || 'N/A'}</p>
              {selectedReturn.images?.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {selectedReturn.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>
          )}
          <select className="input w-full" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pickup_scheduled">Pickup Scheduled</option>
            <option value="picked_up">Picked Up</option>
            <option value="received">Received</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Input label="Refund Amount" type="number" step="0.01" value={formData.refundAmount} onChange={(e) => setFormData({ ...formData, refundAmount: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1">Admin Notes</label>
            <textarea className="input w-full h-24" value={formData.adminNotes} onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
