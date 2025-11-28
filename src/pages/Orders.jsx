import { useState, useEffect } from 'react';
import { orders } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function Orders() {
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const params = {};
      if (filter === 'pending') params.approved = false;
      if (filter === 'approved') params.approved = true;

      const response = await orders.list({ ...params, limit: 50 });
      setOrderList(response.data.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (order) => {
    if (window.confirm(`Approve order #${order._id}?`)) {
      try {
        await orders.approve(order._id);
        loadOrders();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to approve order');
      }
    }
  };

  const handleReject = async (order) => {
    const reason = window.prompt('Reason for rejection:');
    if (reason) {
      try {
        await orders.reject(order._id, { reason });
        loadOrders();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject order');
      }
    }
  };

  const columns = [
    { key: '_id', label: 'Order ID', width: '150px' },
    {
      key: 'user',
      label: 'Customer',
      render: (row) => row.userId ? `${row.userId.userFirstName} ${row.userId.userLastName}` : 'N/A',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => `$${row.amount?.toLocaleString() || 0}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`badge badge-${row.status}`}>{row.status}</span>
      ),
    },
    {
      key: 'approved',
      label: 'Approved',
      render: (row) => (
        <span className={`badge ${row.approved ? 'badge-success' : 'badge-warning'}`}>
          {row.approved ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="table-actions">
          {!row.approved && (
            <>
              <button onClick={() => handleApprove(row)} className="icon-btn success" title="Approve">
                <CheckCircle size={16} />
              </button>
              <button onClick={() => handleReject(row)} className="icon-btn danger" title="Reject">
                <XCircle size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="orders-page">
      <h1 className="page-title">Orders Management</h1>

      <Card
        actions={
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Orders
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved
            </button>
            <button className="icon-btn" onClick={loadOrders}>
              <RefreshCw size={18} />
            </button>
          </div>
        }
      >
        <Table columns={columns} data={orderList} loading={loading} />
      </Card>
    </div>
  );
}
