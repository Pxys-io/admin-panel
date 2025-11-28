import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Store, ShoppingCart, CreditCard,
  BarChart3, Shield, FileText, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, permission: null },
    { path: '/users', label: 'Users', icon: Users, permission: 'users.view' },
    { path: '/stores', label: 'Stores', icon: Store, permission: 'stores.view' },
    { path: '/orders', label: 'Orders', icon: ShoppingCart, permission: 'orders.view' },
    { path: '/payments', label: 'Payments', icon: CreditCard, permission: 'payments.view' },
    { path: '/reports', label: 'Reports', icon: BarChart3, permission: 'reports.financial' },
    { path: '/admins', label: 'Admins', icon: Shield, permission: 'admin.view' },
    { path: '/audit', label: 'Audit Logs', icon: FileText, permission: 'audit.view' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>Admin Panel</h1>
        <p className="role-badge">{user?.adminRoleDisplayName || 'Admin'}</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          if (item.permission && !hasPermission(item.permission)) return null;

          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
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
