import { useState, useEffect } from 'react';
import { reports } from '../api/client';
import Card from '../components/Card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, ShoppingCart, Store as StoreIcon } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
  const [salesData, setSalesData] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [storePerformance, setStorePerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('day');

  useEffect(() => {
    loadReports();
  }, [timeRange]);

  const loadReports = async () => {
    try {
      const [salesRes, ordersRes, usersRes, storesRes] = await Promise.all([
        reports.sales({ groupBy: timeRange }),
        reports.orders(),
        reports.users(),
        reports.stores(),
      ]);

      setSalesData(salesRes.data.salesData);
      setOrderStats(ordersRes.data.orderStats);
      setUserAnalytics(usersRes.data.userAnalytics);
      setStorePerformance(storesRes.data.storePerformance.slice(0, 10));
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="reports-page">
      <h1 className="page-title">Reports & Analytics</h1>

      <div className="reports-header">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-range-select"
        >
          <option value="hour">Hourly</option>
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>

      {userAnalytics && (
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
                <Users size={24} />
              </div>
              <div className="stat-details">
                <p className="stat-label">Total Users</p>
                <h3 className="stat-value">{userAnalytics.summary?.totalUsers || 0}</h3>
                <p className="stat-change">+{userAnalytics.summary?.newUsers || 0} new</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
                <ShoppingCart size={24} />
              </div>
              <div className="stat-details">
                <p className="stat-label">Total Orders</p>
                <h3 className="stat-value">{orderStats?.statusBreakdown?.reduce((acc, s) => acc + s.count, 0) || 0}</h3>
                <p className="stat-change">All statuses</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="charts-grid">
        <Card title="Sales Trend" className="chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalRevenue" stroke="#3b82f6" name="Revenue" />
              <Line type="monotone" dataKey="totalOrders" stroke="#10b981" name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {orderStats?.statusBreakdown && (
          <Card title="Order Status Distribution" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStats.statusBreakdown}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {orderStats.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {storePerformance.length > 0 && (
        <Card title="Top Performing Stores" className="chart-card">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={storePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="storeName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="totalOrders" fill="#10b981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {userAnalytics?.topCustomers && (
        <Card title="Top Customers" className="chart-card">
          <div className="top-customers">
            {userAnalytics.topCustomers.slice(0, 10).map((customer, index) => (
              <div key={customer.userId} className="customer-item">
                <div className="customer-rank">#{index + 1}</div>
                <div className="customer-info">
                  <p className="customer-name">{customer.userName}</p>
                  <p className="customer-email">{customer.email}</p>
                </div>
                <div className="customer-stats">
                  <p className="customer-orders">{customer.orderCount} orders</p>
                  <p className="customer-spent">${customer.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
