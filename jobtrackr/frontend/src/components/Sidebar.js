import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/applications', label: 'Applications', icon: 'bi-folder2-open', matchChildren: true },
  { to: '/applications/new', label: 'Add Application', icon: 'bi-plus-circle' },
  { to: '/reminders', label: 'Reminders', icon: 'bi-bell' },
  { to: '/profile', label: 'Profile', icon: 'bi-person' },
];

// Left navigation. On small screens it slides in/out ("open" comes from Layout).
function Sidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <i className="bi bi-briefcase-fill me-2"></i>JobTrackr
          <small>Track. Apply. Follow Up. Get Hired.</small>
        </div>
        <nav className="sidebar-nav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              // "Applications" stays highlighted on /applications/5 but not on /applications/new
              className={({ isActive }) => {
                const active = link.matchChildren
                  ? pathname.startsWith('/applications') && pathname !== '/applications/new'
                  : isActive;
                return `sidebar-link${active ? ' active' : ''}`;
              }}
            >
              <i className={`bi ${link.icon}`}></i>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          Logout
        </button>
      </aside>
      {/* dark overlay behind the sidebar on mobile; clicking it closes the menu */}
      {open && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  );
}

export default Sidebar;
