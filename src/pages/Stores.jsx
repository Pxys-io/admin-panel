import { useState, useEffect } from 'react';
import { stores } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';

export default function Stores() {
  const [storeList, setStoreList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    platformFeePercentage: 10,
    autoConfirmOrders: false,
  });
  const [feeData, setFeeData] = useState({ platformFeePercentage: 10 });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await stores.list({ limit: 50 });
      setStoreList(response.data.stores);
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedStore) {
        await stores.update(selectedStore._id, formData);
      } else {
        await stores.create(formData);
      }
      setShowModal(false);
      setSelectedStore(null);
      resetForm();
      loadStores();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save store');
    }
  };

  const handleFeeUpdate = async (e) => {
    e.preventDefault();
    try {
      await stores.updateFees(selectedStore._id, feeData);
      setShowFeeModal(false);
      setSelectedStore(null);
      loadStores();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update fees');
    }
  };

  const handleDelete = async (store) => {
    if (window.confirm(`Delete store ${store.name}?`)) {
      try {
        await stores.delete(store._id);
        loadStores();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete store');
      }
    }
  };

  const openEditModal = (store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name,
      address: store.address,
      city: store.city,
      state: store.state,
      country: store.country,
      postalCode: store.postalCode,
      platformFeePercentage: store.platformFeePercentage,
      autoConfirmOrders: store.autoConfirmOrders,
    });
    setShowModal(true);
  };

  const openFeeModal = (store) => {
    setSelectedStore(store);
    setFeeData({ platformFeePercentage: store.platformFeePercentage });
    setShowFeeModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      platformFeePercentage: 10,
      autoConfirmOrders: false,
    });
  };

  const columns = [
    { key: 'name', label: 'Store Name' },
    {
      key: 'location',
      label: 'Location',
      render: (row) => `${row.city}, ${row.state}`,
    },
    {
      key: 'platformFeePercentage',
      label: 'Platform Fee',
      render: (row) => `${row.platformFeePercentage}%`,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-danger'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => openEditModal(row)} className="icon-btn">
            <Edit size={16} />
          </button>
          <button onClick={() => openFeeModal(row)} className="icon-btn">
            <DollarSign size={16} />
          </button>
          <button onClick={() => handleDelete(row)} className="icon-btn danger">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="stores-page">
      <h1 className="page-title">Stores Management</h1>

      <Card
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Store
          </Button>
        }
      >
        <Table columns={columns} data={storeList} loading={loading} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedStore(null);
          resetForm();
        }}
        title={selectedStore ? 'Edit Store' : 'Add New Store'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <Input
            label="Store Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <div className="form-row">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            />
            <Input
              label="Postal Code"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              required
            />
          </div>
          <Input
            label="Platform Fee (%)"
            type="number"
            value={formData.platformFeePercentage}
            onChange={(e) => setFormData({ ...formData, platformFeePercentage: parseFloat(e.target.value) })}
            required
          />
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.autoConfirmOrders}
                onChange={(e) => setFormData({ ...formData, autoConfirmOrders: e.target.checked })}
              />
              <span>Auto Confirm Orders</span>
            </label>
          </div>
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedStore ? 'Update' : 'Create'} Store
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showFeeModal}
        onClose={() => {
          setShowFeeModal(false);
          setSelectedStore(null);
        }}
        title="Update Platform Fee"
      >
        <form onSubmit={handleFeeUpdate} className="modal-form">
          <Input
            label="Platform Fee Percentage"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={feeData.platformFeePercentage}
            onChange={(e) => setFeeData({ platformFeePercentage: parseFloat(e.target.value) })}
            required
          />
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setShowFeeModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Fee</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
