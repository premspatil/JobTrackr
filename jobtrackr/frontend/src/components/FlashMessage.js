import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Shows a one-time success message that the PREVIOUS page passed along, e.g.
//   navigate('/applications', { state: { message: 'Application added successfully.' } })
function FlashMessage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState(location.state?.message || '');

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the state so the message doesn't come back after a page refresh
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  if (!message) return null;
  return (
    <div className="alert alert-success alert-dismissible fade show" role="alert">
      <i className="bi bi-check-circle me-2"></i>
      {message}
      <button type="button" className="btn-close" aria-label="Close" onClick={() => setMessage('')}></button>
    </div>
  );
}

export default FlashMessage;
