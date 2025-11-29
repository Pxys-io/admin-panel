import { useState, useEffect } from 'react';
import { brands } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { Award, Plus, Edit, Trash2 } from 'lucide-react';

export default function Brands() {
  const [brandList, setBrandList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', logo: '', website: '', sortOrder: 0, isActive: true });

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await brands.list();
      setBrandList(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await brands.update(editingBrand._id, formData);
      } else {
        await brands.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this brand?')) {
      await brands.delete(id);
      fetchBrands();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', logo: '', website: '', sortOrder: 0, isActive: true });
    setEditingBrand(null);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, slug: brand.slug || '', description: brand.description || '', logo: brand.logo || '', website: brand.website || '', sortOrder: brand.sortOrder || 0, isActive: brand.isActive !== false });
    setShowModal(true);
  };

  const columns = [
    { key: 'name', label: 'Brand', render: (val, row) => (
      <div className="flex items-center gap-2">
        {row.logo && <img src={row.logo} alt="" className="w-8 h-8 rounded object-contain" />}
        <span className="font-medium">{val}</span>
      </div>
    )},
    { key: 'website', label: 'Website', render: (val) => val ? <a href={val} target="_blank" rel="noreferrer" className="text-blue-500">{val}</a> : '-' },
    { key: 'sortOrder', label: 'Order' },
    { key: 'isActive', label: 'Status', render: (val) => <span className={`badge ${val ? 'badge-success' : 'badge-danger'}`}>{val ? 'Active' : 'Inactive'}</span> },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => openEditModal(row)} className="btn-icon"><Edit size={16} /></button>
        <button onClick={() => handleDelete(row._id)} className="btn-icon text-red-500"><Trash2 size={16} /></button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Award /> Brands</h1>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus size={16} /> Add Brand</Button>
      </div>
      <Card><Table columns={columns} data={brandList} loading={loading} /></Card>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBrand ? 'Edit Brand' : 'Add Brand'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <Input label="Logo URL" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} />
          <Input label="Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
          <Input label="Sort Order" type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} /> Active
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editingBrand ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
