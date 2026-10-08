import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import AddApplication from './pages/AddApplication';
import ApplicationDetails from './pages/ApplicationDetails';
import Applications from './pages/Applications';
import Dashboard from './pages/Dashboard';
import EditApplication from './pages/EditApplication';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Reminders from './pages/Reminders';

// Login/Register are only for visitors; logged-in users are sent to the dashboard.
function PublicOnly({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function NotFound() {
  return (
    <div className="text-center py-5">
      <h1 className="display-4">404</h1>
      <p className="text-muted">The page you are looking for does not exist.</p>
      <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

      {/* Private pages: ProtectedRoute checks the login, Layout adds sidebar + navbar */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/new" element={<AddApplication />} />
          <Route path="/applications/:id" element={<ApplicationDetails />} />
          <Route path="/applications/:id/edit" element={<EditApplication />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
