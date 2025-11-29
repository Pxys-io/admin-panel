import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Store, ShoppingCart, CreditCard,
  BarChart3, Shield, FileText, LogOut, Package, FolderTree,
  Award, Ticket, Image, Gift, RotateCcw, MessageSquare,
  Truck, MapPin, Receipt, UserCheck, Settings, ChevronDown,
  Box, DollarSign, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout, hasPermission, isSeller } = useAuth();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Seller-specific menu sections
  const sellerMenuSections = [
    {
      title: 'Main',
      items: [
        { path: '/seller', label: 'Dashboard', icon: LayoutDashboard, permission: null },
        { path: '/seller/orders', label: 'Orders', icon: ShoppingCart, permission: null },
      ]
    },
    {
      title: 'Products',
      items: [
        { path: '/seller/products', label: 'My Products', icon: Package, permission: null },
        { path: '/seller/inventory', label: 'Inventory', icon: Box, permission: null },
      ]
    },
    {
      title: 'Finance',
      items: [
        { path: '/seller/earnings', label: 'Earnings', icon: DollarSign, permission: null },
      ]
    },
  ];

  // Admin menu sections
  const adminMenuSections = [
    {
      title: 'Main',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard, permission: null },
        { path: '/orders', label: 'Orders', icon: ShoppingCart, permission: 'orders.view' },
        { path: '/payments', label: 'Payments', icon: CreditCard, permission: 'payments.view' },
      ]
    },
    {
      title: 'Catalog',
      items: [
        { path: '/products', label: 'Products', icon: Package, permission: 'products.view' },
        { path: '/categories', label: 'Categories', icon: FolderTree, permission: 'categories.view' },
        { path: '/brands', label: 'Brands', icon: Award, permission: 'brands.view' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { path: '/promo-codes', label: 'Promo Codes', icon: Ticket, permission: 'promo_codes.view' },
        { path: '/sliders', label: 'Sliders', icon: Image, permission: 'sliders.view' },
      ]
    },
    {
      title: 'Support',
      items: [
        { path: '/returns', label: 'Returns', icon: RotateCcw, permission: 'returns.view' },
        { path: '/tickets', label: 'Tickets', icon: MessageSquare, permission: 'tickets.view' },
      ]
    },
    {
      title: 'Partners',
      items: [
        { path: '/sellers', label: 'Sellers', icon: Store, permission: 'sellers.view' },
        { path: '/affiliates', label: 'Affiliates', icon: UserCheck, permission: 'affiliates.view' },
      ]
    },
    {
      title: 'Finance',
      items: [
        { path: '/transactions', label: 'Transactions', icon: Receipt, permission: 'transactions.view' },
      ]
    },
    {
      title: 'Users & Admin',
      items: [
        { path: '/users', label: 'Users', icon: Users, permission: 'users.view' },
        { path: '/stores', label: 'Stores', icon: Store, permission: 'stores.view' },
        { path: '/admins', label: 'Admins', icon: Shield, permission: 'admin.view' },
      ]
    },
    {
      title: 'System',
      items: [
        { path: '/reports', label: 'Reports', icon: BarChart3, permission: 'reports.financial' },
        { path: '/audit', label: 'Audit Logs', icon: FileText, permission: 'audit.view' },
        { path: '/settings', label: 'Settings', icon: Settings, permission: 'settings.view' },
      ]
    },
  ];

  const menuSections = isSeller() ? sellerMenuSections : adminMenuSections;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>{isSeller() ? 'Seller Portal' : 'Admin Panel'}</h1>
        <p className="role-badge">{user?.adminRoleDisplayName || (isSeller() ? 'Seller' : 'Admin')}</p>
      </div>

      <nav className="sidebar-nav">
        {menuSections.map((section) => {
          const visibleItems = section.items.filter(
            item => !item.permission || hasPermission(item.permission)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <p className="user-name">{user?.userFirstName} {user?.userLastName}</p>
          <p className="user-email">{user?.email}</p>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
