import { useState, useEffect } from 'react';
import { transactions, wallet } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { Receipt, Search, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function Transactions() {
  const [transactionList, setTransactionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [filters, setFilters] = useState({ category: '', type: '' });
  const [walletData, setWalletData] = useState({ user_id: '', amount: '', type: 'credit', message: '' });

  useEffect(() => { fetchTransactions(); }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactions.list(filters);
      setTransactionList(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletOperation = async (e) => {
    e.preventDefault();
    try {
      await wallet.manage({
        user_id: walletData.user_id,
        amount: parseFloat(walletData.amount),
        type: walletData.type,
        message: walletData.message
      });
      setShowWalletModal(false);
      setWalletData({ user_id: '', amount: '', type: 'credit', message: '' });
      fetchTransactions();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const columns = [
    { key: 'user', label: 'User', render: (val) => (
      <div>
        <div className="font-medium">{val?.userFirstName} {val?.userLastName}</div>
        <div className="text-sm text-gray-500">{val?.email}</div>
      </div>
    )},
    { key: 'type', label: 'Type', render: (val) => (
      <span className={`flex items-center gap-1 ${val === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
        {val === 'credit' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
        {val}
      </span>
    )},
    { key: 'amount', label: 'Amount', render: (val, row) => (
      <span className={`font-medium ${row.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
        {row.type === 'credit' ? '+' : '-'}${val.toFixed(2)}
      </span>
    )},
    { key: 'balanceAfter', label: 'Balance After', render: (val) => `$${val.toFixed(2)}` },
    { key: 'category', label: 'Category', render: (val) => <span className="badge badge-secondary capitalize">{val?.replace('_', ' ')}</span> },
    { key: 'description', label: 'Description', render: (val) => <span className="truncate max-w-[200px] block">{val || '-'}</span> },
    { key: 'createdAt', label: 'Date', render: (val) => new Date(val).toLocaleString() }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Receipt /> Transactions</h1>
        <Button onClick={() => setShowWalletModal(true)}><Plus size={16} /> Wallet Operation</Button>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <select className="input" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <select className="input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All Categories</option>
            <option value="order_payment">Order Payment</option>
            <option value="refund">Refund</option>
            <option value="cashback">Cashback</option>
            <option value="referral">Referral</option>
            <option value="admin_credit">Admin Credit</option>
            <option value="admin_debit">Admin Debit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="commission">Commission</option>
            <option value="affiliate">Affiliate</option>
          </select>
        </div>
        <Table columns={columns} data={transactionList} loading={loading} />
      </Card>

      <Modal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} title="Wallet Operation">
        <form onSubmit={handleWalletOperation} className="space-y-4">
          <Input label="User ID" value={walletData.user_id} onChange={(e) => setWalletData({ ...walletData, user_id: e.target.value })} required placeholder="Enter user ID" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount" type="number" step="0.01" value={walletData.amount} onChange={(e) => setWalletData({ ...walletData, amount: e.target.value })} required />
            <select className="input" value={walletData.type} onChange={(e) => setWalletData({ ...walletData, type: e.target.value })}>
              <option value="credit">Credit (Add)</option>
              <option value="debit">Debit (Subtract)</option>
            </select>
          </div>
          <Input label="Message/Reason" value={walletData.message} onChange={(e) => setWalletData({ ...walletData, message: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowWalletModal(false)}>Cancel</Button>
            <Button type="submit">Process</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
