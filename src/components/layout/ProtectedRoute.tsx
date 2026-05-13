import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  if (!isAuthenticated) {
    if (!_hasHydrated) {
      return <LoadingSpinner/>; // or a loading spinner
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
