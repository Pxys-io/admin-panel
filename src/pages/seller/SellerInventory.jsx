import { useState, useEffect } from 'react';
import { seller } from '../../api/client';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Box, AlertTriangle, Plus, Minus } from 'lucide-react';

export default function SellerInventory() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updateData, setUpdateData] = useState({
    action: 'add',
    quantity: '',
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const [productsRes, lowStockRes] = await Promise.all([
        seller.listProducts(),
        seller.getLowStock(),
      ]);
      setProducts(productsRes.data.stocks || []);
      setLowStock(lowStockRes.data.lowStockItems || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryUpdate = async (e) => {
    e.preventDefault();
    try {
      const quantity = updateData.action === 'add'
        ? parseInt(updateData.quantity)
        : -parseInt(updateData.quantity);

      await seller.updateInventory({
        stockId: selectedProduct._id,
        quantityChange: quantity,
      });
      setShowUpdateModal(false);
      setSelectedProduct(null);
      setUpdateData({ action: 'add', quantity: '' });
      loadInventory();
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert(error.response?.data?.message || 'Failed to update inventory');
    }
  };

  const openUpdateModal = (product) => {
    setSelectedProduct(product);
    setUpdateData({ action: 'add', quantity: '' });
    setShowUpdateModal(true);
  };

  const columns = [
    {
      key: 'productId',
      label: 'Product',
      render: (_, row) => (
        <div className="product-cell">
          {row.productId?.productImages?.[0] && (
            <img src={row.productId.productImages[0]} alt="" className="product-thumb" />
          )}
          <span>{row.productId?.productName || 'Unknown'}</span>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Current Stock',
      render: (val, row) => {
        const isLow = val <= (row.minStock || 5);
        return (
          <span className={isLow ? 'stock-low' : 'stock-ok'}>
            {isLow && <AlertTriangle size={14} />}
            {val}
          </span>
        );
      },
    },
    {
      key: 'minStock',
      label: 'Min Stock',
      render: (val) => val || 5,
    },
    {
      key: 'reserved',
      label: 'Reserved',
      render: (val) => val || 0,
    },
    {
      key: 'available',
      label: 'Available',
      render: (_, row) => (row.quantity || 0) - (row.reserved || 0),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button onClick={() => openUpdateModal(row)} className="btn btn-sm btn-secondary">
          Update Stock
        </button>
      ),
    },
  ];

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Box size={24} />
          Inventory Management
        </h1>
      </div>

      {lowStock.length > 0 && (
        <Card className="alert-card warning">
          <div className="alert-content">
            <AlertTriangle size={20} />
            <div>
              <h4>Low Stock Alert</h4>
              <p>{lowStock.length} products are running low on stock</p>
            </div>
          </div>
          <div className="low-stock-list">
            {lowStock.map((item) => (
              <div key={item._id} className="low-stock-item">
                <span>{item.productId?.productName}</span>
                <span className="stock-count">{item.quantity} remaining</span>
                <button onClick={() => openUpdateModal(item)} className="btn btn-sm btn-primary">
                  Restock
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="All Products">
        <Table columns={columns} data={products} />
      </Card>

      {/* Update Inventory Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => { setShowUpdateModal(false); setSelectedProduct(null); }}
        title="Update Inventory"
      >
        <form onSubmit={handleInventoryUpdate}>
          <div className="form-group">
            <label>Product</label>
            <input
              type="text"
              value={selectedProduct?.productId?.productName || ''}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Current Stock</label>
            <input
              type="text"
              value={selectedProduct?.quantity || 0}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Action</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="action"
                  value="add"
                  checked={updateData.action === 'add'}
                  onChange={(e) => setUpdateData({ ...updateData, action: e.target.value })}
                />
                <Plus size={16} /> Add Stock
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="action"
                  value="remove"
                  checked={updateData.action === 'remove'}
                  onChange={(e) => setUpdateData({ ...updateData, action: e.target.value })}
                />
                <Minus size={16} /> Remove Stock
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={updateData.quantity}
              onChange={(e) => setUpdateData({ ...updateData, quantity: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>New Stock Level</label>
            <input
              type="text"
              value={
                updateData.quantity
                  ? updateData.action === 'add'
                    ? (selectedProduct?.quantity || 0) + parseInt(updateData.quantity || 0)
                    : Math.max(0, (selectedProduct?.quantity || 0) - parseInt(updateData.quantity || 0))
                  : selectedProduct?.quantity || 0
              }
              disabled
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              onClick={() => { setShowUpdateModal(false); setSelectedProduct(null); }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Update Stock</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
