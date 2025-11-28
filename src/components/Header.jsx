import { Bell, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h2>Welcome back, {user?.userFirstName}!</h2>
        </div>
        <div className="header-right">
          <button className="icon-btn">
            <Bell size={20} />
          </button>
          <button className="icon-btn">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
