import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner className="py-20" />;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
