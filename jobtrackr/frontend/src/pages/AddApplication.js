import { useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../api/api';
import ApplicationForm from '../components/ApplicationForm';

function AddApplication() {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    await applicationsAPI.create(payload); // errors are handled inside the form
    navigate('/applications', { state: { message: 'Application added successfully.' } });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Add Application</h2>
          <p className="text-muted mb-0">Fields marked with * are required.</p>
        </div>
      </div>
      <ApplicationForm onSubmit={handleSubmit} />
    </div>
  );
}

export default AddApplication;
