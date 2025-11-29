import { useState, useEffect } from 'react';
import { tickets } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { MessageSquare, Plus, Eye, Send } from 'lucide-react';

export default function Tickets() {
  const [ticketList, setTicketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '' });

  useEffect(() => { fetchTickets(); }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await tickets.list(filters);
      setTicketList(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openMessages = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await tickets.getMessages(ticket._id);
      setMessages(res.data.data || []);
      setShowMessageModal(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await tickets.sendMessage({ ticketId: selectedTicket._id, message: newMessage });
      setNewMessage('');
      const res = await tickets.getMessages(selectedTicket._id);
      setMessages(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await tickets.updateStatus(id, { status });
      fetchTickets();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = { open: 'badge-warning', in_progress: 'badge-info', waiting_customer: 'badge-secondary', resolved: 'badge-success', closed: 'badge-danger' };
    return colors[status] || 'badge-secondary';
  };

  const getPriorityColor = (priority) => {
    const colors = { low: 'badge-secondary', medium: 'badge-info', high: 'badge-warning', urgent: 'badge-danger' };
    return colors[priority] || 'badge-secondary';
  };

  const columns = [
    { key: 'ticketNumber', label: 'Ticket #', render: (val) => <span className="font-mono font-medium">{val}</span> },
    { key: 'subject', label: 'Subject', render: (val) => <span className="truncate max-w-[200px] block">{val}</span> },
    { key: 'user', label: 'Customer', render: (val) => val ? `${val.userFirstName} ${val.userLastName}` : '-' },
    { key: 'category', label: 'Category', render: (val) => <span className="capitalize">{val}</span> },
    { key: 'priority', label: 'Priority', render: (val) => <span className={`badge ${getPriorityColor(val)}`}>{val}</span> },
    { key: 'status', label: 'Status', render: (val) => <span className={`badge ${getStatusColor(val)}`}>{val?.replace('_', ' ')}</span> },
    { key: 'createdAt', label: 'Created', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => openMessages(row)} className="btn-icon"><MessageSquare size={16} /></button>
        <select className="input py-1 text-sm" value={row.status} onChange={(e) => updateStatus(row._id, e.target.value)}>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting_customer">Waiting</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare /> Support Tickets</h1>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_customer">Waiting Customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select className="input" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <Table columns={columns} data={ticketList} loading={loading} />
      </Card>

      <Modal isOpen={showMessageModal} onClose={() => setShowMessageModal(false)} title={`Ticket: ${selectedTicket?.ticketNumber}`} size="lg">
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium">{selectedTicket?.subject}</h4>
            <div className="flex gap-4 text-sm text-gray-500 mt-1">
              <span>Category: {selectedTicket?.category}</span>
              <span>Priority: {selectedTicket?.priority}</span>
              <span>Status: {selectedTicket?.status}</span>
            </div>
          </div>

          <div className="h-64 overflow-y-auto border rounded p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg ${msg.senderType === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                  <p>{msg.message}</p>
                  <div className={`text-xs mt-1 ${msg.senderType === 'admin' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {messages.length === 0 && <p className="text-center text-gray-400">No messages yet</p>}
          </div>

          <div className="flex gap-2">
            <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1" onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
            <Button onClick={sendMessage}><Send size={16} /></Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
