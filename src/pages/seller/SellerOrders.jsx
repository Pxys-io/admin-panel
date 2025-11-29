import { useState, useEffect } from 'react';
import { seller } from '../../api/client';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { ShoppingCart, Eye, Truck } from 'lucide-react';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await seller.listOrders(params);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await seller.updateOrderStatus(selectedOrder._id, newStatus);
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const openDetailModal = async (order) => {
    try {
      const response = await seller.getOrder(order._id);
      setSelectedOrder(response.data.order);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const statusOptions = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  const columns = [
    {
      key: '_id',
      label: 'Order ID',
      render: (val) => `#${val?.slice(-6) || 'N/A'}`,
    },
    {
      key: 'orderId',
      label: 'Main Order',
      render: (_, row) => row.orderId?.orderNumber || `#${row.orderId?._id?.slice(-6) || 'N/A'}`,
    },
    {
      key: 'items',
      label: 'Items',
      render: (val) => val?.length || 0,
    },
    {
      key: 'sellerAmount',
      label: 'Amount',
      render: (val) => `$${val?.toFixed(2) || '0.00'}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`status-badge status-${val}`}>
          {val?.replace(/_/g, ' ') || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button onClick={() => openDetailModal(row)} className="btn-icon" title="View Details">
            <Eye size={16} />
          </button>
          <button onClick={() => openStatusModal(row)} className="btn-icon" title="Update Status">
            <Truck size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <ShoppingCart size={24} />
          My Orders
        </h1>
        <div className="filter-group">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={orders} />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedOrder(null); }}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="order-details">
            <div className="detail-section">
              <h4>Order Information</h4>
              <p><strong>Order ID:</strong> #{selectedOrder._id?.slice(-6)}</p>
              <p><strong>Status:</strong> <span className={`status-badge status-${selectedOrder.status}`}>{selectedOrder.status}</span></p>
              <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p><strong>Amount:</strong> ${selectedOrder.sellerAmount?.toFixed(2)}</p>
            </div>

            {selectedOrder.shippingAddress && (
              <div className="detail-section">
                <h4>Shipping Address</h4>
                <p>{selectedOrder.shippingAddress.name}</p>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                <p>Phone: {selectedOrder.shippingAddress.phone}</p>
              </div>
            )}

            <div className="detail-section">
              <h4>Items</h4>
              <div className="order-items">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.productId?.productName || 'Product'}</span>
                      <span className="item-variant">{item.variantId?.variantName || ''}</span>
                    </div>
                    <div className="item-qty">x{item.quantity}</div>
                    <div className="item-price">${item.price?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => { setShowStatusModal(false); setSelectedOrder(null); setNewStatus(''); }}
        title="Update Order Status"
      >
        <form onSubmit={handleStatusUpdate}>
          <div className="form-group">
            <label>Current Status</label>
            <input type="text" value={selectedOrder?.status || ''} disabled />
          </div>
          <div className="form-group">
            <label>New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              onClick={() => { setShowStatusModal(false); setSelectedOrder(null); setNewStatus(''); }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Update Status</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
