import { useEffect, useState } from 'react';
import { getErrorMessage, getFieldErrors, profileAPI } from '../api/api';
import FormField from '../components/FormField';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Profile() {
  const { updateUser } = useAuth();
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    profileAPI
      .get()
      .then((response) => !cancelled && setValues(response.data))
      .catch((err) => !cancelled && setFormError(getErrorMessage(err, 'Could not load your profile.')));
    return () => { cancelled = true; };
  }, []);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccess('');

    const found = {};
    if (!values.first_name.trim()) found.first_name = 'First name is required.';
    if (!values.last_name.trim()) found.last_name = 'Last name is required.';
    if (!values.username.trim()) found.username = 'Username is required.';
    if (!values.email.trim()) found.email = 'Email is required.';
    else if (!EMAIL_PATTERN.test(values.email.trim())) found.email = 'Enter a valid email address.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const { data } = await profileAPI.update({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
      });
      setValues(data);
      updateUser(data); // refresh the name shown in the top bar
      setSuccess('Profile updated successfully.');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setErrors(fieldErrors);
      setFormError(
        Object.keys(fieldErrors).length > 0
          ? 'Please fix the highlighted fields.'
          : getErrorMessage(err, 'Could not update your profile.')
      );
    }
    setSaving(false);
  };

  if (!values) {
    return formError ? <div className="alert alert-danger">{formError}</div> : <Loading text="Loading profile..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Profile</h2>
          <p className="text-muted mb-0">Manage your account details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="card form-card">
        <div className="card-body">
          {success && <div className="alert alert-success">{success}</div>}
          {formError && <div className="alert alert-danger">{formError}</div>}
          <div className="row">
            <div className="col-md-6">
              <FormField label="First Name" name="first_name" value={values.first_name} onChange={handleChange} error={errors.first_name} required />
            </div>
            <div className="col-md-6">
              <FormField label="Last Name" name="last_name" value={values.last_name} onChange={handleChange} error={errors.last_name} required />
            </div>
            <div className="col-md-6">
              <FormField label="Username" name="username" value={values.username} onChange={handleChange} error={errors.username} required />
            </div>
            <div className="col-md-6">
              <FormField label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
