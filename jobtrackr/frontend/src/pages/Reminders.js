import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage, remindersAPI } from '../api/api';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatDateTime } from '../utils/format';

// One titled list of reminders. `dateField` says which date to show.
function ReminderSection({ title, icon, items, dateField, emptyText, highlight }) {
  return (
    <div className="card mb-4">
      <div className={`card-header ${highlight || ''}`}>
        <i className={`bi ${icon} me-2`}></i>{title} <span className="badge bg-secondary ms-1">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="card-body text-muted">{emptyText}</div>
      ) : (
        <ul className="list-group list-group-flush">
          {items.map((item) => (
            <li className="list-group-item followup-item" key={item.id}>
              <div>
                <strong>{item.company_name}</strong> <span className="text-muted">— {item.job_title}</span>
                <div className="small mt-1">
                  <i className="bi bi-calendar-event me-1"></i>
                  {dateField === 'interview_date' ? formatDateTime(item[dateField]) : formatDate(item[dateField])}{' '}
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <Link to={`/applications/${item.id}`} className="btn btn-sm btn-outline-primary">View Application</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Reminders() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    remindersAPI
      .get()
      .then((response) => !cancelled && setData(response.data))
      .catch((err) => !cancelled && setError(getErrorMessage(err, 'Could not load reminders.')));
    return () => { cancelled = true; };
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <Loading text="Loading reminders..." />;

  const nothingAtAll = Object.values(data).every((list) => list.length === 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reminders</h2>
          <p className="text-muted mb-0">Follow-ups and interviews that need your attention.</p>
        </div>
      </div>

      {nothingAtAll && (
        <div className="card">
          <div className="card-body text-center py-5 text-muted">No upcoming reminders.</div>
        </div>
      )}

      {!nothingAtAll && (
        <>
          {data.overdue_followups.length > 0 && (
            <ReminderSection title="Overdue Follow-ups" icon="bi-exclamation-triangle" items={data.overdue_followups} dateField="follow_up_date" emptyText="" highlight="text-danger" />
          )}
          <ReminderSection title="Today's Follow-ups" icon="bi-bell" items={data.todays_followups} dateField="follow_up_date" emptyText="No follow-ups due today." />
          <ReminderSection title="Upcoming Follow-ups" icon="bi-calendar-week" items={data.upcoming_followups} dateField="follow_up_date" emptyText="No upcoming follow-ups." />
          <ReminderSection title="Interviews" icon="bi-chat-square-text" items={data.interviews} dateField="interview_date" emptyText="No upcoming interviews." />
        </>
      )}
    </div>
  );
}

export default Reminders;
