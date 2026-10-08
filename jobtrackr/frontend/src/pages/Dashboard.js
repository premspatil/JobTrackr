import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dashboardAPI, getErrorMessage } from '../api/api';
import FlashMessage from '../components/FlashMessage';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import { STATUS_COLORS } from '../utils/constants';
import { formatDate } from '../utils/format';

// The six cards from the requirements. "key" matches a key in data.stats from the API.
const STAT_CARDS = [
  { key: 'total', label: 'Total Applications', icon: 'bi-folder2-open', color: 'primary' },
  { key: 'applied', label: 'Applied', icon: 'bi-send', color: 'info' },
  { key: 'under_review', label: 'Under Review', icon: 'bi-hourglass-split', color: 'warning' },
  { key: 'interview', label: 'Interview', icon: 'bi-chat-dots', color: 'purple' },
  { key: 'selected', label: 'Selected', icon: 'bi-trophy', color: 'success' },
  { key: 'rejected', label: 'Rejected', icon: 'bi-x-octagon', color: 'danger' },
];

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false; // avoids updating state if the page was left meanwhile
    dashboardAPI
      .get()
      .then((response) => !cancelled && setData(response.data))
      .catch((err) => !cancelled && setError(getErrorMessage(err, 'Could not load the dashboard.')));
    return () => { cancelled = true; };
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <Loading text="Loading dashboard..." />;

  const { stats, status_counts: statusCounts, recent_applications: recent, upcoming_followups: upcoming } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted mb-0">Your job search at a glance.</p>
        </div>
        <Link to="/applications/new" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>Add Application
        </Link>
      </div>

      <FlashMessage />

      {/* Statistics cards: numbers come from the database via /api/dashboard/ */}
      <div className="row g-3 mb-4">
        {STAT_CARDS.map((card) => (
          <div className="col-6 col-md-4 col-xl-2" key={card.key}>
            <div className={`stat-card stat-${card.color}`}>
              <i className={`bi ${card.icon}`}></i>
              <div className="stat-value">{stats[card.key]}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-header">Applications by Status</div>
            <div className="card-body">
              {stats.total === 0 ? (
                <p className="text-muted text-center my-5">No data yet. Add your first application to see the chart.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={statusCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Applications" radius={[6, 6, 0, 0]}>
                      {statusCounts.map((item) => (
                        <Cell key={item.status} fill={STATUS_COLORS[item.status]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-header">Upcoming Follow-ups</div>
            <div className="card-body p-0">
              {upcoming.length === 0 ? (
                <p className="text-muted text-center my-5">No upcoming follow-ups.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {upcoming.map((item) => (
                    <li className="list-group-item followup-item" key={item.id}>
                      <div>
                        <strong>{item.company_name}</strong>
                        <div className="small text-muted">{item.job_title}</div>
                        <div className="small mt-1">
                          <i className="bi bi-calendar-event me-1"></i>{formatDate(item.follow_up_date)}{' '}
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                      <Link to={`/applications/${item.id}`} className="btn btn-sm btn-outline-primary">View Application</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Recent Applications</span>
          <Link to="/applications" className="small">View all</Link>
        </div>
        {recent.length === 0 ? (
          <div className="card-body text-center py-5">
            <p className="text-muted">You have not added any applications yet.</p>
            <Link to="/applications/new" className="btn btn-primary">Add your first application</Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Company</th><th>Job Role</th><th>Location</th><th>Applied On</th><th>Status</th><th>Follow-up</th><th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.company_name}</td>
                    <td>{item.job_title}</td>
                    <td>{item.location || '—'}</td>
                    <td>{formatDate(item.application_date)}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{formatDate(item.follow_up_date)}</td>
                    <td className="text-end">
                      <Link to={`/applications/${item.id}`} className="btn btn-sm btn-outline-primary">View Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
