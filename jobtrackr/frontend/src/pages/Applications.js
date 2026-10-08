import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI, getErrorMessage } from '../api/api';
import ApplicationCard from '../components/ApplicationCard';
import ConfirmModal from '../components/ConfirmModal';
import FlashMessage from '../components/FlashMessage';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import { JOB_TYPE_OPTIONS, STATUS_OPTIONS } from '../utils/constants';
import { formatDate } from '../utils/format';

const EMPTY_FILTERS = { search: '', status: '', job_type: '', location: '', date_from: '', date_to: '' };

// Wait until the user stops typing before calling the API
function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function Applications() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [applications, setApplications] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0); // change it to force a reload
  const [toDelete, setToDelete] = useState(null); // application waiting for delete confirmation
  const [deleting, setDeleting] = useState(false);

  // Text inputs are debounced; dropdown/date filters apply immediately
  const debouncedSearch = useDebounced(filters.search);
  const debouncedLocation = useDebounced(filters.location);

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  // Fetch from the backend whenever a filter or the page changes.
  // The backend does the real searching/filtering (see ApplicationListCreateView).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = { page };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (filters.status) params.status = filters.status;
    if (filters.job_type) params.job_type = filters.job_type;
    if (debouncedLocation.trim()) params.location = debouncedLocation.trim();
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;

    applicationsAPI
      .list(params)
      .then((response) => {
        if (cancelled) return;
        setApplications(response.data.results);
        setCount(response.data.count);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        // Page number too high (e.g. after deleting the last item of the last page)
        if (err.response?.status === 404 && page > 1) {
          setPage(1);
          return;
        }
        setError(getErrorMessage(err, 'Could not load applications.'));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, debouncedSearch, debouncedLocation, filters.status, filters.job_type, filters.date_from, filters.date_to, reloadKey]);

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
    setPage(1); // a new filter always starts at page 1
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await applicationsAPI.remove(toDelete.id);
      setMessage(`Application at ${toDelete.company_name} deleted.`);
      setToDelete(null);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete the application.'));
      setToDelete(null);
    }
    setDeleting(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Applications</h2>
          <p className="text-muted mb-0">{count} {count === 1 ? 'application' : 'applications'} found</p>
        </div>
        <Link to="/applications/new" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>Add Application
        </Link>
      </div>

      <FlashMessage />
      {message && (
        <div className="alert alert-success alert-dismissible fade show">
          {message}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setMessage('')}></button>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search + filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-lg-4">
              <input className="form-control" name="search" placeholder="Search company, job title or location..." value={filters.search} onChange={handleFilterChange} aria-label="Search" />
            </div>
            <div className="col-6 col-lg-2">
              <select className="form-select" name="status" value={filters.status} onChange={handleFilterChange} aria-label="Filter by status">
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-6 col-lg-2">
              <select className="form-select" name="job_type" value={filters.job_type} onChange={handleFilterChange} aria-label="Filter by job type">
                <option value="">All Job Types</option>
                {JOB_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-lg-4">
              <input className="form-control" name="location" placeholder="Filter by location" value={filters.location} onChange={handleFilterChange} aria-label="Filter by location" />
            </div>
            <div className="col-6 col-lg-3">
              <label className="form-label small text-muted mb-0">Applied from</label>
              <input type="date" className="form-control" name="date_from" value={filters.date_from} onChange={handleFilterChange} />
            </div>
            <div className="col-6 col-lg-3">
              <label className="form-label small text-muted mb-0">Applied to</label>
              <input type="date" className="form-control" name="date_to" value={filters.date_to} onChange={handleFilterChange} />
            </div>
            <div className="col-lg-3 d-flex align-items-end">
              {hasFilters && (
                <button className="btn btn-outline-secondary" onClick={clearFilters}>
                  <i className="bi bi-x-circle me-1"></i>Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading text="Loading applications..." />
      ) : applications.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <p className="text-muted">
              {hasFilters ? 'No applications match your search or filters.' : 'You have not added any applications yet.'}
            </p>
            {!hasFilters && <Link to="/applications/new" className="btn btn-primary">Add your first application</Link>}
          </div>
        </div>
      ) : (
        <>
          {/* Table on tablets/desktops */}
          <div className="card d-none d-md-block">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Company</th><th>Job Title</th><th>Location</th><th>Application Date</th>
                    <th>Status</th><th>Follow-up Date</th><th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="fw-semibold">{app.company_name}</td>
                      <td>{app.job_title}</td>
                      <td>{app.location || '—'}</td>
                      <td>{formatDate(app.application_date)}</td>
                      <td><StatusBadge status={app.status} /></td>
                      <td>{formatDate(app.follow_up_date)}</td>
                      <td className="text-end text-nowrap">
                        <Link to={`/applications/${app.id}`} className="btn btn-sm btn-outline-primary me-1">View</Link>
                        <Link to={`/applications/${app.id}/edit`} className="btn btn-sm btn-outline-secondary me-1">Edit</Link>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setToDelete(app)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards on phones */}
          <div className="d-md-none">
            {applications.map((app) => (
              <ApplicationCard key={app.id} application={app} onDelete={setToDelete} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <i className="bi bi-chevron-left"></i> Previous
              </button>
              <span className="text-muted">Page {page} of {totalPages}</span>
              <button className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        show={Boolean(toDelete)}
        title="Delete application"
        message="Are you sure you want to delete this application?"
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default Applications;
