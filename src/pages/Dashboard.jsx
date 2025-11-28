import { useState, useEffect } from 'react';
import { reports } from '../api/client';
import Card from '../components/Card';
import { Users, Store, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await reports.dashboard();
      setData(response.data.dashboard);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="error">Failed to load dashboard data</div>;
  }

  const stats = [
    {
      label: 'Total Users',
      value: data.users?.total || 0,
      change: `+${data.users?.new || 0} new`,
      icon: Users,
      color: '#3b82f6',
    },
    {
      label: 'Total Orders',
      value: data.orders?.totalOrders || 0,
      change: `${data.orders?.pendingOrders || 0} pending`,
      icon: ShoppingCart,
      color: '#8b5cf6',
    },
    {
      label: 'Total Revenue',
      value: `$${(data.orders?.totalRevenue || 0).toLocaleString()}`,
      change: `${data.orders?.deliveredOrders || 0} delivered`,
      icon: DollarSign,
      color: '#10b981',
    },
    {
      label: 'Active Stores',
      value: data.stores?.active || 0,
      change: `${data.stores?.total || 0} total`,
      icon: Store,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard Overview</h1>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="stat-card">
              <div className="stat-content">
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  <Icon size={24} />
                </div>
                <div className="stat-details">
                  <p className="stat-label">{stat.label}</p>
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-change">{stat.change}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="charts-grid">
        <Card title="Top Selling Products" className="chart-card">
          {data.topProducts && data.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalSold" fill="#3b82f6" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No sales data available</p>
          )}
        </Card>

        <Card title="Recent Orders" className="chart-card">
          <div className="recent-orders">
            {data.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="recent-order-item">
                  <div>
                    <p className="order-user">{order.userId?.userFirstName} {order.userId?.userLastName}</p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="order-right">
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                    <p className="order-amount">${order.amount}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent orders</p>
            )}
          </div>
        </Card>
      </div>

      <Card title="Platform Fees Collected" className="metric-card">
        <div className="metric-value">
          <DollarSign size={32} />
          <h2>${(data.platformFees || 0).toLocaleString()}</h2>
        </div>
      </Card>
    </div>
  );
}
