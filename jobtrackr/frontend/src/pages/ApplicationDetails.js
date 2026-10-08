import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applicationsAPI, getErrorMessage } from '../api/api';
import ConfirmModal from '../components/ConfirmModal';
import FlashMessage from '../components/FlashMessage';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import { STATUS_OPTIONS } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/format';

// One "label: value" row
function Detail({ label, children }) {
  return (
    <div className="col-md-6 detail-item">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{children || '—'}</div>
    </div>
  );
}

function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setApplication(null);
    applicationsAPI
      .get(id)
      .then((response) => !cancelled && setApplication(response.data))
      .catch((err) => !cancelled && setError(getErrorMessage(err, 'Could not load the application.')));
    return () => { cancelled = true; };
  }, [id]);

  // Quick status change: sends only the changed field with PATCH
  const handleStatusChange = async (event) => {
    setActionError('');
    setStatusSaving(true);
    try {
      const { data } = await applicationsAPI.patch(id, { status: event.target.value });
      setApplication(data);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not update the status.'));
    }
    setStatusSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await applicationsAPI.remove(id);
      navigate('/applications', { state: { message: 'Application deleted successfully.' } });
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete the application.'));
      setShowDelete(false);
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <div>
        <div className="alert alert-danger">{error}</div>
        <Link to="/applications" className="btn btn-outline-secondary">Back to Applications</Link>
      </div>
    );
  }
  if (!application) return <Loading text="Loading application..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{application.company_name}</h2>
          <p className="text-muted mb-0">{application.job_title}</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Link to="/applications" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i>Back to Applications
          </Link>
          <Link to={`/applications/${id}/edit`} className="btn btn-primary">
            <i className="bi bi-pencil me-1"></i>Edit Application
          </Link>
          <button className="btn btn-outline-danger" onClick={() => setShowDelete(true)}>
            <i className="bi bi-trash me-1"></i>Delete Application
          </button>
        </div>
      </div>

      <FlashMessage />
      {actionError && <div className="alert alert-danger">{actionError}</div>}

      <div className="card mb-3">
        <div className="card-body d-flex flex-wrap align-items-center gap-3">
          <span className="fw-semibold">Status:</span>
          <StatusBadge status={application.status} />
          <select className="form-select form-select-sm status-select" value={application.status} onChange={handleStatusChange} disabled={statusSaving} aria-label="Change status">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {statusSaving && <small className="text-muted">Saving...</small>}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row">
            <Detail label="Company Name">{application.company_name}</Detail>
            <Detail label="Job Title">{application.job_title}</Detail>
            <Detail label="Job Type">{application.job_type_display}</Detail>
            <Detail label="Location">{application.location}</Detail>
            <Detail label="Application Date">{formatDate(application.application_date)}</Detail>
            <Detail label="Salary">{application.salary}</Detail>
            <Detail label="Recruiter">{application.recruiter_name}</Detail>
            <Detail label="Recruiter Email">
              {application.recruiter_email && <a href={`mailto:${application.recruiter_email}`}>{application.recruiter_email}</a>}
            </Detail>
            <Detail label="Interview Date">{application.interview_date && formatDateTime(application.interview_date)}</Detail>
            <Detail label="Follow-up Date">{application.follow_up_date && formatDate(application.follow_up_date)}</Detail>
            <div className="col-12 detail-item">
              <div className="detail-label">Job URL</div>
              <div className="detail-value">
                {application.job_url ? (
                  <a href={application.job_url} target="_blank" rel="noopener noreferrer">{application.job_url}</a>
                ) : '—'}
              </div>
            </div>
            <div className="col-12 detail-item">
              <div className="detail-label">Notes</div>
              <div className="detail-value notes-text">{application.notes || '—'}</div>
            </div>
            <Detail label="Created">{formatDateTime(application.created_at)}</Detail>
            <Detail label="Last Updated">{formatDateTime(application.updated_at)}</Detail>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={showDelete}
        title="Delete application"
        message="Are you sure you want to delete this application?"
        loading={deleting}
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default ApplicationDetails;
