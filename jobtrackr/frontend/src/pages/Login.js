import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/api';
import FlashMessage from '../components/FlashMessage';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const foundErrors = {};
    if (!values.username.trim()) foundErrors.username = 'Enter your username or email.';
    if (!values.password) foundErrors.password = 'Enter your password.';
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    setLoading(true);
    try {
      await login(values.username.trim(), values.password);
      // Go back to the page the user originally wanted, or the dashboard
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Login failed. Please try again.'));
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <i className="bi bi-briefcase-fill"></i>
          <h1>JobTrackr</h1>
          <p>Track. Apply. Follow Up. Get Hired.</p>
        </div>

        <FlashMessage />
        {formError && <div className="alert alert-danger">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Username or Email" name="username" value={values.username} onChange={handleChange} error={errors.username} autoComplete="username" autoFocus />
          <FormField label="Password" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} autoComplete="current-password" />
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Don&apos;t have an account? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
