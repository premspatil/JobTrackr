import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applicationsAPI, getErrorMessage } from '../api/api';
import ApplicationForm from '../components/ApplicationForm';
import Loading from '../components/Loading';

function EditApplication() {
  const { id } = useParams(); // the :id from the URL /applications/:id/edit
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');

  // Load the existing data so the form can be pre-filled
  useEffect(() => {
    let cancelled = false;
    applicationsAPI
      .get(id)
      .then((response) => !cancelled && setApplication(response.data))
      .catch((err) => !cancelled && setError(getErrorMessage(err, 'Could not load the application.')));
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (payload) => {
    await applicationsAPI.update(id, payload);
    navigate(`/applications/${id}`, { state: { message: 'Application updated successfully.' } });
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
          <h2>Edit Application</h2>
          <p className="text-muted mb-0">{application.job_title} at {application.company_name}</p>
        </div>
      </div>
      <ApplicationForm
        initialValues={application}
        onSubmit={handleSubmit}
        submitLabel="Update Application"
        cancelTo={`/applications/${id}`}
      />
    </div>
  );
}

export default EditApplication;
