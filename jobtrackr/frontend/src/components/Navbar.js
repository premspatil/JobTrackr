import { useAuth } from '../context/AuthContext';

// Top bar: hamburger button (mobile), brand and the logged-in user.
function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username;

  return (
    <header className="topbar">
      <button className="btn btn-light d-lg-none" onClick={onToggleSidebar} aria-label="Toggle navigation">
        <i className="bi bi-list fs-4"></i>
      </button>
      <span className="topbar-brand d-lg-none">
        <i className="bi bi-briefcase-fill me-2"></i>JobTrackr
      </span>
      <div className="ms-auto topbar-user">
        <i className="bi bi-person-circle me-2"></i>
        <span className="d-none d-sm-inline">{displayName}</span>
      </div>
    </header>
  );
}

export default Navbar;
