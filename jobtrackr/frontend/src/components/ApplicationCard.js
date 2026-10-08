import { Link } from 'react-router-dom';
import { formatDate } from '../utils/format';
import StatusBadge from './StatusBadge';

// Card version of one application row. Used on small screens instead of the table.
function ApplicationCard({ application, onDelete }) {
  return (
    <div className="card application-card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-0">{application.company_name}</h6>
            <small className="text-muted">{application.job_title}</small>
          </div>
          <StatusBadge status={application.status} />
        </div>
        <ul className="list-unstyled small mt-3 mb-3">
          <li><i className="bi bi-geo-alt me-2"></i>{application.location || '—'}</li>
          <li><i className="bi bi-calendar-check me-2"></i>Applied: {formatDate(application.application_date)}</li>
          <li><i className="bi bi-bell me-2"></i>Follow-up: {formatDate(application.follow_up_date)}</li>
        </ul>
        <div className="d-flex gap-2">
          <Link to={`/applications/${application.id}`} className="btn btn-sm btn-outline-primary">View</Link>
          <Link to={`/applications/${application.id}/edit`} className="btn btn-sm btn-outline-secondary">Edit</Link>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(application)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationCard;
