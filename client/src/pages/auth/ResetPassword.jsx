import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as authApi from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get('token') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setMsg(''); setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setMsg('Password updated. Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="mt-1 text-sm text-white/50">Paste your reset token and choose a new password.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Input id="token" label="Reset token" required value={token} onChange={(e) => setToken(e.target.value)} />
          <Input id="password" type="password" label="New password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</Button>
        </form>
        {msg && <p className="mt-4 rounded-md bg-green-500/10 p-3 text-sm text-green-400">{msg}</p>}
        {error && <p className="mt-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
        <p className="mt-4 text-sm text-white/50">
          <Link to="/login" className="text-brand-400 hover:underline">Back to login</Link>
        </p>
      </Card>
    </div>
  );
}
