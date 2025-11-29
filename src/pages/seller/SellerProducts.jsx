import { useState, useEffect } from 'react';
import { seller } from '../../api/client';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    price: '',
    quantity: '',
    minStock: 5,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const [productsRes, availableRes] = await Promise.all([
        seller.listProducts(),
        seller.getAvailableProducts(),
      ]);
      setProducts(productsRes.data.stocks || []);
      setAvailableProducts(availableRes.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await seller.addProduct({
        productId: formData.productId,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        minStock: parseInt(formData.minStock),
      });
      setShowAddModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.response?.data?.message || 'Failed to add product');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await seller.updateProduct(selectedProduct._id, {
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        minStock: parseInt(formData.minStock),
      });
      setShowEditModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      alert(error.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm('Are you sure you want to remove this product from your store?')) return;
    try {
      await seller.removeProduct(product._id);
      loadProducts();
    } catch (error) {
      console.error('Error removing product:', error);
      alert(error.response?.data?.message || 'Failed to remove product');
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      productId: product.productId?._id || '',
      price: product.price?.toString() || '',
      quantity: product.quantity?.toString() || '',
      minStock: product.minStock?.toString() || '5',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      price: '',
      quantity: '',
      minStock: 5,
    });
    setSelectedProduct(null);
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
      key: 'price',
      label: 'Price',
      render: (val) => `$${val?.toFixed(2) || '0.00'}`,
    },
    {
      key: 'quantity',
      label: 'Stock',
      render: (val, row) => (
        <span className={val <= (row.minStock || 5) ? 'low-stock' : ''}>
          {val}
        </span>
      ),
    },
    {
      key: 'minStock',
      label: 'Min Stock',
      render: (val) => val || 5,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => (
        <span className={`status-badge status-${val ? 'active' : 'inactive'}`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button onClick={() => openEditModal(row)} className="btn-icon" title="Edit">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(row)} className="btn-icon btn-danger" title="Remove">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Package size={24} />
          My Products
        </h1>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <Card>
        <Table columns={columns} data={products} />
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add Product to Store"
      >
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label>Select Product</label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              <option value="">-- Select a product --</option>
              {availableProducts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.productName} - ${p.productVariants?.[0]?.price || p.price || 0}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Selling Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Initial Stock Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Minimum Stock Alert</label>
            <input
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Add Product</button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit Product"
      >
        <form onSubmit={handleEdit}>
          <div className="form-group">
            <label>Product</label>
            <input
              type="text"
              value={selectedProduct?.productId?.productName || ''}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Selling Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Minimum Stock Alert</label>
            <input
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Update Product</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
