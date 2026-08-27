import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ArrowUpRight } from '../../components/Icons.jsx';
import '../../styles/admin.css';

const NAV = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/projects', label: 'Projects', end: false },
  { to: '/admin/messages', label: 'Messages', end: false },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin">
      <aside className="admin__side">
        <div className="admin__brand">
          <Link to="/">Pradumn Saindane<span>.</span></Link>
          <span className="admin__brand-tag">control room</span>
        </div>

        <nav className="admin__nav" aria-label="Admin">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `admin__nav-link ${isActive ? 'is-active' : ''}`}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin__side-foot">
          <a href="/" target="_blank" rel="noreferrer" className="admin__viewsite">
            View live site <ArrowUpRight size={14} />
          </a>
        </div>
      </aside>

      <div className="admin__main">
        <header className="admin__top">
          <div className="admin__who">
            <span className="admin__who-dot" />
            Signed in as <strong>{user?.name || user?.email}</strong>
          </div>
          <button className="btn btn--ghost admin__logout" onClick={onLogout}>
            Sign out
          </button>
        </header>

        <div className="admin__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
