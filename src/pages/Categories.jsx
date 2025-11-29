import { useState, useEffect } from 'react';
import { categories } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { FolderTree, Plus, Edit, Trash2 } from 'lucide-react';

export default function Categories() {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', parentCategory: '', slug: '', image: '',
    sortOrder: 0, showInMenu: true, showInHome: false, isActive: true
  });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categories.list();
      setCategoryList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, sortOrder: parseInt(formData.sortOrder) || 0 };
      if (!data.parentCategory) delete data.parentCategory;
      if (editingCategory) {
        await categories.update(editingCategory._id, data);
      } else {
        await categories.create(data);
      }
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      await categories.delete(id);
      fetchCategories();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', parentCategory: '', slug: '', image: '', sortOrder: 0, showInMenu: true, showInHome: false, isActive: true });
    setEditingCategory(null);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name, description: cat.description || '', parentCategory: cat.parentCategory?._id || '',
      slug: cat.slug || '', image: cat.image || '', sortOrder: cat.sortOrder || 0,
      showInMenu: cat.showInMenu !== false, showInHome: cat.showInHome || false, isActive: cat.isActive !== false
    });
    setShowModal(true);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (val, row) => (
      <div className="flex items-center gap-2">
        {row.image && <img src={row.image} alt="" className="w-8 h-8 rounded" />}
        <span>{row.parentCategory ? '└ ' : ''}{val}</span>
      </div>
    )},
    { key: 'parentCategory', label: 'Parent', render: (val) => val?.name || '-' },
    { key: 'sortOrder', label: 'Order' },
    { key: 'isActive', label: 'Status', render: (val) => (
      <span className={`badge ${val ? 'badge-success' : 'badge-danger'}`}>{val ? 'Active' : 'Inactive'}</span>
    )},
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
        <h1 className="text-2xl font-bold flex items-center gap-2"><FolderTree /> Categories</h1>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus size={16} /> Add Category</Button>
      </div>

      <Card>
        <Table columns={columns} data={categoryList} loading={loading} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCategory ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated if empty" />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <select className="input w-full" value={formData.parentCategory} onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}>
            <option value="">No Parent (Root Category)</option>
            {categoryList.filter(c => c._id !== editingCategory?._id).map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <Input label="Image URL" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
          <Input label="Sort Order" type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })} />
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.showInMenu} onChange={(e) => setFormData({ ...formData, showInMenu: e.target.checked })} /> Show in Menu
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.showInHome} onChange={(e) => setFormData({ ...formData, showInHome: e.target.checked })} /> Show on Home
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} /> Active
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editingCategory ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
