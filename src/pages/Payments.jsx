import { useState, useEffect } from 'react';
import { payments } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function Payments() {
  const [paymentList, setPaymentList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
    loadStats();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await payments.list({ limit: 50 });
      setPaymentList(response.data.payments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await payments.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const columns = [
    { key: '_id', label: 'Payment ID', width: '150px' },
    {
      key: 'user',
      label: 'Customer',
      render: (_, row) => row.userId ? `${row.userId.userFirstName} ${row.userId.userLastName}` : 'N/A',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => `$${val?.toLocaleString() || 0}`,
    },
    {
      key: 'currency',
      label: 'Currency',
      render: (val) => val?.toUpperCase() || 'USD',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`badge badge-${val}`}>{val}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

  return (
    <div className="payments-page">
      <h1 className="page-title">Payments</h1>

      {stats && (
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
                <DollarSign size={24} />
              </div>
              <div className="stat-details">
                <p className="stat-label">Total Revenue</p>
                <h3 className="stat-value">${(stats.overall?.totalRevenue || 0).toLocaleString()}</h3>
                <p className="stat-change">{stats.overall?.totalOrders || 0} orders</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
                <TrendingUp size={24} />
              </div>
              <div className="stat-details">
                <p className="stat-label">Platform Fees</p>
                <h3 className="stat-value">${(stats.fees?.totalFees || 0).toLocaleString()}</h3>
                <p className="stat-change">Collected</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card title="Recent Payments">
        <Table columns={columns} data={paymentList} loading={loading} />
      </Card>
    </div>
  );
}
