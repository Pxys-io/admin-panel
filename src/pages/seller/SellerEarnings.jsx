import { useState, useEffect } from 'react';
import { seller } from '../../api/client';
import Card from '../../components/Card';
import Table from '../../components/Table';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function SellerEarnings() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadEarnings();
  }, [filter]);

  const loadEarnings = async () => {
    try {
      const params = filter !== 'all' ? { type: filter } : {};
      const [earningsRes, dashboardRes] = await Promise.all([
        seller.listEarnings(params),
        seller.dashboard(),
      ]);
      setTransactions(earningsRes.data.transactions || []);
      setStats(dashboardRes.data.stats || {});
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'type',
      label: 'Type',
      render: (val) => (
        <span className={`type-badge type-${val}`}>
          {val?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Transaction'}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (val) => val || '-',
    },
    {
      key: 'orderId',
      label: 'Order',
      render: (_, row) => row.orderId ? `#${row.orderId._id?.slice(-6) || row.orderId.slice(-6)}` : '-',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (val, row) => {
        const isCredit = row.type === 'sale' || row.type === 'credit' || row.type === 'commission';
        return (
          <span className={isCredit ? 'amount-credit' : 'amount-debit'}>
            {isCredit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            ${Math.abs(val || 0).toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`status-badge status-${val || 'completed'}`}>
          {val || 'Completed'}
        </span>
      ),
    },
  ];

  if (loading) {
    return <div className="loading">Loading earnings...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <DollarSign size={24} />
          Earnings & Payouts
        </h1>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
              <DollarSign size={24} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Total Earnings</p>
              <h3 className="stat-value">${(stats.totalRevenue || 0).toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-details">
              <p className="stat-label">This Month</p>
              <h3 className="stat-value">${(stats.monthRevenue || 0).toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>
              <ArrowUpRight size={24} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Pending Payout</p>
              <h3 className="stat-value">${(stats.pendingPayout || 0).toLocaleString()}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="card-header-actions">
          <h3>Transaction History</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Transactions</option>
            <option value="sale">Sales</option>
            <option value="commission">Commissions</option>
            <option value="payout">Payouts</option>
            <option value="refund">Refunds</option>
          </select>
        </div>
        <Table columns={columns} data={transactions} />
      </Card>
    </div>
  );
}
