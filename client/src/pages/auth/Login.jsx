import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Link as RouterLink } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl bg-white p-8 shadow-lg shadow-brand-500/10 border border-brand-200">
        <h1 className="text-2xl font-extrabold tracking-tight text-black">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to track your meals.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input id="email" name="email" label="Email or phone" required
            value={form.email} onChange={onChange} placeholder="you@example.com or +91XXXXXXXXXX" />
          <Input id="password" name="password" type="password" label="Password" required
            value={form.password} onChange={onChange} placeholder="••••••••" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
          <RouterLink to="/forgot-password" className="text-brand-700 font-medium hover:underline">
            Forgot password?
          </RouterLink>
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-700 font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
