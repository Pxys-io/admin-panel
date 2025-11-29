import { useState, useEffect } from 'react';
import { products, categories, brands } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { Package, Plus, Edit, Trash2, Eye, Tag } from 'lucide-react';

export default function Products() {
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', status: '' });
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', oldPrice: '', salePrice: '',
    stockCount: '', category: '', brand: '', tags: '', cargoWeight: '',
    isInAffiliate: false, affiliateCommission: '', isActive: true
  });

  useEffect(() => { fetchData(); }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, brandRes] = await Promise.all([
        products.list(filters),
        categories.list({ from_select: 1 }),
        brands.list()
      ]);
      setProductList(prodRes.data.data || []);
      setCategoryList(catRes.data.data || []);
      setBrandList(brandRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        stockCount: parseInt(formData.stockCount),
        cargoWeight: parseFloat(formData.cargoWeight),
        affiliateCommission: formData.affiliateCommission ? parseFloat(formData.affiliateCommission) : 0,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        imageURLs: formData.imageURLs || ['https://via.placeholder.com/300']
      };
      if (editingProduct) {
        await products.update(editingProduct._id, data);
      } else {
        await products.create(data);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await products.delete(id);
      fetchData();
    }
  };

  const handleView = async (product) => {
    try {
      const res = await products.get(product._id);
      setViewingProduct(res.data.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', price: '', oldPrice: '', salePrice: '',
      stockCount: '', category: '', brand: '', tags: '', cargoWeight: '',
      isInAffiliate: false, affiliateCommission: '', isActive: true
    });
    setEditingProduct(null);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || '',
      salePrice: product.salePrice || '',
      stockCount: product.stockCount,
      category: product.category?._id || product.category,
      brand: product.brand?._id || product.brand || '',
      tags: product.tags?.join(', ') || '',
      cargoWeight: product.cargoWeight,
      isInAffiliate: product.isInAffiliate || false,
      affiliateCommission: product.affiliateCommission || '',
      isActive: product.isActive !== false
    });
    setShowModal(true);
  };

  const columns = [
    { key: 'title', label: 'Product', render: (_, row) => (
      <div className="flex items-center gap-3">
        <img src={row.imageURLs?.[0] || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded object-cover" />
        <div>
          <div className="font-medium">{row.title}</div>
          <div className="text-sm text-gray-500">{row.category?.name}</div>
        </div>
      </div>
    )},
    { key: 'price', label: 'Price', render: (val, row) => (
      <div>
        <div className="font-medium">${val}</div>
        {row.salePrice && <div className="text-sm text-green-600">${row.salePrice}</div>}
      </div>
    )},
    { key: 'stockCount', label: 'Stock', render: (val) => (
      <span className={`badge ${val > 10 ? 'badge-success' : val > 0 ? 'badge-warning' : 'badge-danger'}`}>
        {val}
      </span>
    )},
    { key: 'isActive', label: 'Status', render: (val) => (
      <span className={`badge ${val ? 'badge-success' : 'badge-danger'}`}>
        {val ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => handleView(row)} className="btn-icon"><Eye size={16} /></button>
        <button onClick={() => openEditModal(row)} className="btn-icon"><Edit size={16} /></button>
        <button onClick={() => handleDelete(row._id)} className="btn-icon text-red-500"><Trash2 size={16} /></button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Package /> Products</h1>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus size={16} /> Add Product</Button>
      </div>

      <Card>
        <div className="flex gap-4 mb-4 flex-wrap">
          <Input placeholder="Search products..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-64" />
          <select className="input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All Categories</option>
            {categoryList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <Table columns={columns} data={productList} loading={loading} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            <select className="input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
              <option value="">Select Category</option>
              {categoryList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            <Input label="Old Price" type="number" step="0.01" value={formData.oldPrice} onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })} />
            <Input label="Sale Price" type="number" step="0.01" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Stock Count" type="number" value={formData.stockCount} onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })} required />
            <Input label="Cargo Weight (kg)" type="number" step="0.01" value={formData.cargoWeight} onChange={(e) => setFormData({ ...formData, cargoWeight: e.target.value })} required />
            <select className="input" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })}>
              <option value="">Select Brand</option>
              {brandList.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <Input label="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isInAffiliate} onChange={(e) => setFormData({ ...formData, isInAffiliate: e.target.checked })} />
              Enable Affiliate
            </label>
            {formData.isInAffiliate && (
              <Input label="Commission %" type="number" value={formData.affiliateCommission} onChange={(e) => setFormData({ ...formData, affiliateCommission: e.target.value })} className="w-32" />
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
              Active
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editingProduct ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Product Details" size="lg">
        {viewingProduct && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <img src={viewingProduct.imageURLs?.[0] || 'https://via.placeholder.com/200'} alt="" className="w-48 h-48 rounded object-cover" />
              <div className="flex-1">
                <h3 className="text-xl font-bold">{viewingProduct.title}</h3>
                <p className="text-gray-600 mt-2">{viewingProduct.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div><span className="text-gray-500">Price:</span> <strong>${viewingProduct.price}</strong></div>
                  <div><span className="text-gray-500">Stock:</span> <strong>{viewingProduct.stockCount}</strong></div>
                  <div><span className="text-gray-500">Category:</span> <strong>{viewingProduct.category?.name}</strong></div>
                  <div><span className="text-gray-500">Brand:</span> <strong>{viewingProduct.brand?.name || 'N/A'}</strong></div>
                </div>
              </div>
            </div>
            {viewingProduct.variants?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Variants ({viewingProduct.variants.length})</h4>
                <div className="grid grid-cols-3 gap-2">
                  {viewingProduct.variants.map((v, i) => (
                    <div key={i} className="p-2 border rounded text-sm">
                      <div>SKU: {v.sku || 'N/A'}</div>
                      <div>Price: ${v.price}</div>
                      <div>Stock: {v.stock}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
