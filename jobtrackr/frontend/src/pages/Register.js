import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, getErrorMessage, getFieldErrors } from '../api/api';
import FormField from '../components/FormField';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    first_name: '', last_name: '', username: '', email: '', password: '', confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  const validate = () => {
    const found = {};
    if (!values.first_name.trim()) found.first_name = 'First name is required.';
    if (!values.last_name.trim()) found.last_name = 'Last name is required.';
    if (!values.username.trim()) found.username = 'Username is required.';
    if (!values.email.trim()) found.email = 'Email is required.';
    else if (!EMAIL_PATTERN.test(values.email.trim())) found.email = 'Enter a valid email address.';
    if (!values.password) found.password = 'Password is required.';
    else if (values.password.length < 8) found.password = 'Password must be at least 8 characters.';
    if (values.confirm_password !== values.password) found.confirm_password = 'Passwords do not match.';
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await authAPI.register({
        ...values,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
      });
      navigate('/login', { state: { message: 'Account created successfully. Please log in.' } });
    } catch (error) {
      // e.g. "A user with that username already exists." appears under the field
      const fieldErrors = getFieldErrors(error);
      setErrors(fieldErrors);
      setFormError(
        Object.keys(fieldErrors).length > 0
          ? 'Please fix the highlighted fields.'
          : getErrorMessage(error, 'Registration failed. Please try again.')
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-brand">
          <i className="bi bi-briefcase-fill"></i>
          <h1>Create your account</h1>
          <p>Track. Apply. Follow Up. Get Hired.</p>
        </div>

        {formError && <div className="alert alert-danger">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            <div className="col-sm-6">
              <FormField label="First Name" name="first_name" value={values.first_name} onChange={handleChange} error={errors.first_name} autoComplete="given-name" />
            </div>
            <div className="col-sm-6">
              <FormField label="Last Name" name="last_name" value={values.last_name} onChange={handleChange} error={errors.last_name} autoComplete="family-name" />
            </div>
          </div>
          <FormField label="Username" name="username" value={values.username} onChange={handleChange} error={errors.username} autoComplete="username" />
          <FormField label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} autoComplete="email" />
          <div className="row">
            <div className="col-sm-6">
              <FormField label="Password" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} autoComplete="new-password" />
            </div>
            <div className="col-sm-6">
              <FormField label="Confirm Password" name="confirm_password" type="password" value={values.confirm_password} onChange={handleChange} error={errors.confirm_password} autoComplete="new-password" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
