import { useState, useEffect } from 'react';
import { sliders } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { Image, Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';

export default function Sliders() {
  const [sliderList, setSliderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState({
    title: '', subtitle: '', image: '', link: '', sortOrder: 0, isActive: true
  });

  useEffect(() => { fetchSliders(); }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const res = await sliders.list();
      setSliderList(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, sortOrder: parseInt(formData.sortOrder) || 0 };
      if (editingSlider) {
        await sliders.update(editingSlider._id, data);
      } else {
        await sliders.create(data);
      }
      setShowModal(false);
      resetForm();
      fetchSliders();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this slider?')) {
      await sliders.delete(id);
      fetchSliders();
    }
  };

  const toggleActive = async (slider) => {
    try {
      await sliders.update(slider._id, { isActive: !slider.isActive });
      fetchSliders();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', image: '', link: '', sortOrder: 0, isActive: true });
    setEditingSlider(null);
  };

  const openEditModal = (slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title || '',
      subtitle: slider.subtitle || '',
      image: slider.image || '',
      link: slider.link || '',
      sortOrder: slider.sortOrder || 0,
      isActive: slider.isActive !== false
    });
    setShowModal(true);
  };

  const columns = [
    { key: 'image', label: 'Preview', render: (val) => (
      <img src={val || 'https://via.placeholder.com/120x40'} alt="" className="w-30 h-10 rounded object-cover" />
    )},
    { key: 'title', label: 'Title', render: (val, row) => (
      <div>
        <div className="font-medium">{val || 'No Title'}</div>
        {row.subtitle && <div className="text-sm text-gray-500">{row.subtitle}</div>}
      </div>
    )},
    { key: 'link', label: 'Link', render: (val) => val ? <span className="text-blue-600">{val}</span> : '-' },
    { key: 'sortOrder', label: 'Order', render: (val) => <span className="font-mono">{val}</span> },
    { key: 'isActive', label: 'Status', render: (val) => (
      <span className={`badge ${val ? 'badge-success' : 'badge-danger'}`}>
        {val ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => toggleActive(row)} className={`btn-icon ${row.isActive ? 'text-yellow-500' : 'text-green-500'}`}>
          {row.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button onClick={() => openEditModal(row)} className="btn-icon"><Edit size={16} /></button>
        <button onClick={() => handleDelete(row._id)} className="btn-icon text-red-500"><Trash2 size={16} /></button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Image /> Sliders</h1>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus size={16} /> Add Slider</Button>
      </div>

      <Card><Table columns={columns} data={sliderList} loading={loading} /></Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSlider ? 'Edit Slider' : 'Add Slider'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          <Input label="Subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
          <Input label="Image URL" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} required />
          {formData.image && (
            <img src={formData.image} alt="Preview" className="w-full h-32 object-cover rounded" />
          )}
          <Input label="Link (URL)" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
          <Input label="Sort Order" type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
            Active
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editingSlider ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
