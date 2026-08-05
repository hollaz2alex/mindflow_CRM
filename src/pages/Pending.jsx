import { useQueryClient } from '@tanstack/react-query';
import { Clock, XCircle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// Shown after login while a user is not yet approved. `status` is 'pending' or
// 'rejected'.
export default function Pending({ status = 'pending' }) {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const rejected = status === 'rejected';

  const recheck = () => {
    queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            rejected ? 'bg-rose-50' : 'bg-amber-50'
          }`}
        >
          {rejected ? (
            <XCircle className="h-7 w-7 text-rose-600" />
          ) : (
            <Clock className="h-7 w-7 text-amber-600" />
          )}
        </div>

        <h1 className="mt-4 text-xl font-bold">
          {rejected ? 'Access declined' : 'Waiting for approval'}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {rejected
            ? 'Your account request was declined. If you think this is a mistake, contact an administrator.'
            : 'Your account has been created and is pending review. An administrator will approve it shortly.'}
        </p>

        {user?.email && (
          <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
        )}

        <div className="mt-6 flex gap-2">
          {!rejected && (
            <Button variant="outline" className="flex-1" onClick={recheck}>
              <RefreshCw className="h-4 w-4" />
              Check again
            </Button>
          )}
          <Button variant="outline" className="flex-1" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
