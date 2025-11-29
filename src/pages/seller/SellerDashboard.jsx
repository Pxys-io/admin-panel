import { useState, useEffect } from 'react';
import { seller } from '../../api/client';
import Card from '../../components/Card';
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SellerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await seller.dashboard();
      setData(response.data);
    } catch (error) {
      console.error('Error loading seller dashboard:', error);
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
      label: 'Total Products',
      value: data.stats?.totalProducts || 0,
      icon: Package,
      color: '#3b82f6',
    },
    {
      label: 'Total Orders',
      value: data.stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: '#8b5cf6',
    },
    {
      label: 'Total Revenue',
      value: `$${(data.stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: '#10b981',
    },
    {
      label: 'This Month',
      value: `$${(data.stats?.monthRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="dashboard">
      <h1 className="page-title">Seller Dashboard</h1>

      {data.store && (
        <Card className="store-info-card">
          <h3>{data.store.storeName}</h3>
          <p>{data.store.storeAddress}</p>
        </Card>
      )}

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
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {data.lowStock && data.lowStock.length > 0 && (
        <Card title="Low Stock Alert" className="alert-card">
          <div className="alert-header">
            <AlertTriangle size={20} color="#f59e0b" />
            <span>{data.lowStock.length} products running low</span>
          </div>
          <div className="low-stock-list">
            {data.lowStock.slice(0, 5).map((item) => (
              <div key={item._id} className="low-stock-item">
                <span>{item.productId?.productName || 'Unknown Product'}</span>
                <span className="stock-count">{item.quantity} left</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="charts-grid">
        <Card title="Monthly Revenue" className="chart-card">
          {data.monthlyRevenue && data.monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No revenue data available</p>
          )}
        </Card>

        <Card title="Recent Orders" className="chart-card">
          <div className="recent-orders">
            {data.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="recent-order-item">
                  <div>
                    <p className="order-id">Order #{order._id.slice(-6)}</p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="order-right">
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                    <p className="order-amount">${order.sellerAmount || order.amount}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent orders</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
