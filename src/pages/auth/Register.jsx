import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import AuthShell from '@/components/crm/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    // If email confirmation is on there's no session yet — show a prompt.
    if (data.session) {
      navigate('/');
    } else {
      setDone(true);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start managing your pipeline"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {done ? (
        <p className="text-sm text-gray-600">
          Check your inbox — we sent a confirmation link to{' '}
          <span className="font-medium text-gray-900">{email}</span>. Confirm
          your email, then{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            sign in
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              placeholder="At least 6 characters"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            className="w-full"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
