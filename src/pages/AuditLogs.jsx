import { useState, useEffect } from 'react';
import { audit } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import { FileText, Filter } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    action: '',
  });

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    try {
      const params = {};
      if (filter.category) params.category = filter.category;
      if (filter.action) params.action = filter.action;

      const response = await audit.list({ ...params, limit: 50 });
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'action',
      label: 'Action',
      render: (val) => <span className="audit-action">{val}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (val) => <span className={`badge badge-${val}`}>{val}</span>,
    },
    {
      key: 'admin',
      label: 'Admin',
      render: (_, row) => row.adminId ? `${row.adminId.userFirstName} ${row.adminId.userLastName}` : 'N/A',
    },
    {
      key: 'targetType',
      label: 'Target',
      render: (val) => val || 'N/A',
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (val) => val || 'N/A',
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (val) => new Date(val).toLocaleString(),
    },
  ];

  const categories = ['user', 'store', 'order', 'payment', 'product', 'stock', 'admin'];

  return (
    <div className="audit-page">
      <h1 className="page-title">Audit Logs</h1>

      <Card>
        <div className="audit-filters">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Action:</label>
            <input
              type="text"
              placeholder="Search action..."
              value={filter.action}
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
              className="filter-input"
            />
          </div>

          <button onClick={loadLogs} className="btn btn-primary btn-sm">
            <Filter size={16} />
            Apply
          </button>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={logs}
          loading={loading}
          onRowClick={(log) => {
            if (log.changes) {
              alert(JSON.stringify(log.changes, null, 2));
            }
          }}
        />
      </Card>
    </div>
  );
}
