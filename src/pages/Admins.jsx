import { useState, useEffect } from 'react';
import { admins } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Shield, UserPlus } from 'lucide-react';

export default function Admins() {
  const [adminList, setAdminList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    role: 'support_admin',
    assignedStores: []
  });

  useEffect(() => {
    loadAdmins();
    loadRoles();
  }, []);

  const loadAdmins = async () => {
    try {
      const response = await admins.list();
      setAdminList(response.data.admins);
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await admins.getRoles();
      setRoles(response.data.roles);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await admins.assignRole(formData);
      setShowModal(false);
      resetForm();
      loadAdmins();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign role');
    }
  };

  const handleRemoveRole = async (admin) => {
    if (window.confirm(`Remove admin role from ${admin.email}?`)) {
      try {
        await admins.removeRole(admin._id);
        loadAdmins();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to remove role');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      role: 'support_admin',
      assignedStores: []
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (_, row) => `${row.userFirstName} ${row.userLastName}`,
    },
    { key: 'email', label: 'Email' },
    {
      key: 'adminRole',
      label: 'Role',
      render: (val, row) => (
        <span className="badge badge-primary">
          {val || (row.isAdmin ? 'super_admin' : 'N/A')}
        </span>
      ),
    },
    {
      key: 'assignedStores',
      label: 'Assigned Stores',
      render: (_, row) => row.adminAssignedStores?.length || 0,
    },
    {
      key: 'adminAssignedAt',
      label: 'Assigned Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleRemoveRole(row)}
        >
          Remove Role
        </Button>
      ),
    },
  ];

  return (
    <div className="admins-page">
      <h1 className="page-title">Admin Management</h1>

      <Card
        actions={
          <Button onClick={() => setShowModal(true)}>
            <UserPlus size={18} />
            Assign Admin Role
          </Button>
        }
      >
        <Table columns={columns} data={adminList} loading={loading} />
      </Card>

      {roles.length > 0 && (
        <Card title="Available Roles" className="roles-card">
          <div className="roles-grid">
            {roles.map((role) => (
              <div key={role.role} className="role-card">
                <div className="role-header">
                  <Shield size={24} />
                  <h3>{role.displayName}</h3>
                </div>
                <div className="role-permissions">
                  <p className="permissions-count">
                    {role.permissions.includes('*')
                      ? 'All Permissions'
                      : `${role.permissions.length} Permissions`}
                  </p>
                  {!role.permissions.includes('*') && (
                    <ul className="permissions-list">
                      {role.permissions.slice(0, 5).map((perm) => (
                        <li key={perm}>{perm}</li>
                      ))}
                      {role.permissions.length > 5 && <li>... and {role.permissions.length - 5} more</li>}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Assign Admin Role"
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">User ID *</label>
            <input
              type="text"
              className="form-input"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              placeholder="Enter user ID"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role *</label>
            <select
              className="form-input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              {roles.map((role) => (
                <option key={role.role} value={role.role}>
                  {role.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Assign Role</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
