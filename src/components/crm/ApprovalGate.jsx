import { useProfile } from '@/hooks/useProfile';
import Pending from '@/pages/Pending';

// Sits inside ProtectedRoute (so a session already exists). Blocks the app
// until the user's profile is approved; otherwise shows the pending/rejected
// screen. DB-level RLS enforces the same rule for the API.
export default function ApprovalGate({ children }) {
  const { data: profile, isLoading, isError } = useProfile();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand-olive" />
      </div>
    );
  }

  // If we can't read the profile at all, fail safe to the pending screen.
  if (isError || !profile || profile.status !== 'approved') {
    return <Pending status={profile?.status ?? 'pending'} />;
  }

  return children;
}
