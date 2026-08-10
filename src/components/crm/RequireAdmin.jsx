import { Navigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

// Guards the /admin route. Assumes it renders inside ApprovalGate, so the
// profile is already approved; here we additionally require the admin role.
export default function RequireAdmin({ children }) {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand-olive" />
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
