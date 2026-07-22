import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import PhoneInput from '../../components/common/PhoneInput';
import Button from '../../components/common/Button';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState('email');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name: form.name, password: form.password };
      if (method === 'email') payload.email = form.email;
      else payload.phone = form.phone;
      await signup(payload);
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
        <h1 className="text-2xl font-extrabold tracking-tight text-black">Create your account 🌱</h1>
        <p className="mt-1 text-sm text-slate-500">Sign up with email or phone — just one is enough.</p>

        <div className="mt-5 flex rounded-xl bg-brand-50 p-1 text-sm">
          <button type="button" onClick={() => setMethod('email')}
            className={`flex-1 rounded-lg py-1.5 font-medium transition ${method === 'email' ? 'bg-white text-brand-700 shadow' : 'text-slate-600'}`}>
            ✉️ Email
          </button>
          <button type="button" onClick={() => setMethod('phone')}
            className={`flex-1 rounded-lg py-1.5 font-medium transition ${method === 'phone' ? 'bg-white text-brand-700 shadow' : 'text-slate-600'}`}>
            📱 Phone
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <Input id="name" name="name" label="Name" required value={form.name} onChange={onChange} />
          {method === 'email' ? (
            <Input id="email" name="email" type="email" label="Email" required value={form.email} onChange={onChange} placeholder="you@example.com" />
          ) : (
            <PhoneInput id="phone" label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          )}
          <Input id="password" name="password" type="password" label="Password (min 6)" required value={form.password} onChange={onChange} />
          {method === 'email' && (
            <p className="text-xs text-slate-500">A recovery PIN will be emailed to you for password resets.</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Sign up'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-700 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
