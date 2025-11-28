import { useState, useEffect } from 'react';
import { users } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function Users() {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    userFirstName: '',
    userLastName: '',
    email: '',
    password: '',
    isAdmin: false,
  });

  useEffect(() => {
    loadUsers();
  }, [search]);

  const loadUsers = async () => {
    try {
      const response = await users.list({ search, limit: 50 });
      setUserList(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await users.update(editUser._id, formData);
      } else {
        await users.create(formData);
      }
      setShowModal(false);
      setEditUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Delete user ${user.email}?`)) {
      try {
        await users.delete(user._id);
        loadUsers();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setFormData({
      userFirstName: user.userFirstName,
      userLastName: user.userLastName,
      email: user.email,
      password: '',
      isAdmin: user.isAdmin,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      userFirstName: '',
      userLastName: '',
      email: '',
      password: '',
      isAdmin: false,
    });
  };

  const columns = [
    { key: 'email', label: 'Email' },
    {
      key: 'name',
      label: 'Name',
      render: (row) => `${row.userFirstName} ${row.userLastName}`,
    },
    {
      key: 'isAdmin',
      label: 'Admin',
      render: (row) => (
        <span className={`badge ${row.isAdmin ? 'badge-success' : 'badge-secondary'}`}>
          {row.isAdmin ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => openEditModal(row)} className="icon-btn">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(row)} className="icon-btn danger">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="users-page">
      <h1 className="page-title">Users Management</h1>

      <Card
        actions={
          <div className="page-actions">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={18} />
              Add User
            </Button>
          </div>
        }
      >
        <Table columns={columns} data={userList} loading={loading} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditUser(null);
          resetForm();
        }}
        title={editUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <Input
            label="First Name"
            value={formData.userFirstName}
            onChange={(e) => setFormData({ ...formData, userFirstName: e.target.value })}
            required
          />
          <Input
            label="Last Name"
            value={formData.userLastName}
            onChange={(e) => setFormData({ ...formData, userLastName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          {!editUser && (
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isAdmin}
                onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
              />
              <span>Admin User</span>
            </label>
          </div>
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editUser ? 'Update' : 'Create'} User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
