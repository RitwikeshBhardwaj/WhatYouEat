import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as authApi from '../../api/auth';
import Input from '../../components/common/Input';
import PhoneInput from '../../components/common/PhoneInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

export default function ForgotPassword() {
  const [tab, setTab] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    setError(''); setMsg(''); setLoading(true);
    try {
      const res = await authApi.forgotPasswordEmail(email);
      setMsg(res.data.message);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setError(''); setMsg(''); setLoading(true);
    try {
      const res = await authApi.forgotPasswordPhone(phone);
      setMsg(res.data.message);
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.verifyOtp(phone, otp);
      setOtpVerified(true);
      setMsg('OTP verified. Set a new password.');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const resetWithOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.resetPasswordOtp(phone, otp, password);
      setMsg('Password updated. You can now log in.');
      setOtpVerified(false); setOtpSent(false);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const resetWithPin = async (e) => {
    e.preventDefault();
    setError(''); setMsg(''); setLoading(true);
    try {
      await authApi.resetPasswordPin(email, pin, password);
      setMsg('Password updated. You can now log in.');
      setPin(''); setPassword('');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-500">Reset via email link, SMS OTP, or recovery PIN.</p>

        <div className="mt-5 flex rounded-lg bg-brand-50 p-1 text-sm">
          <button onClick={() => setTab('email')} className={`flex-1 rounded-md py-1.5 ${tab === 'email' ? 'bg-white shadow text-brand-700' : 'text-slate-600'}`}>Email</button>
          <button onClick={() => setTab('phone')} className={`flex-1 rounded-md py-1.5 ${tab === 'phone' ? 'bg-white shadow text-brand-700' : 'text-slate-600'}`}>Phone OTP</button>
          <button onClick={() => setTab('pin')} className={`flex-1 rounded-md py-1.5 ${tab === 'pin' ? 'bg-white shadow text-brand-700' : 'text-slate-600'}`}>PIN</button>
        </div>

        {tab === 'email' && (
          <form onSubmit={sendEmail} className="mt-5 space-y-4">
            <Input id="email" type="email" label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button className="w-full" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</Button>
          </form>
        )}

        {tab === 'phone' && !otpSent && (
          <form onSubmit={sendOtp} className="mt-5 space-y-4">
            <PhoneInput id="phone" label="Phone" required value={phone} onChange={setPhone} />
            <Button className="w-full" disabled={loading}>{loading ? 'Sending…' : 'Send OTP'}</Button>
          </form>
        )}

        {tab === 'phone' && otpSent && !otpVerified && (
          <form onSubmit={verifyOtp} className="mt-5 space-y-4">
            <Input id="otp" label="6-digit OTP" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
            <Button className="w-full" disabled={loading}>{loading ? 'Verifying…' : 'Verify OTP'}</Button>
          </form>
        )}

        {tab === 'phone' && otpVerified && (
          <form onSubmit={resetWithOtp} className="mt-5 space-y-4">
            <Input id="newpw" type="password" label="New password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button className="w-full" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</Button>
          </form>
        )}

        {tab === 'pin' && (
          <form onSubmit={resetWithPin} className="mt-5 space-y-4">
            <Input id="pinemail" type="email" label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="pin" label="6-digit recovery PIN" required value={pin} onChange={(e) => setPin(e.target.value)} maxLength={6} inputMode="numeric" />
            <Input id="pinpw" type="password" label="New password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button className="w-full" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</Button>
          </form>
        )}

        {msg && <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{msg}</p>}
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <p className="mt-4 text-sm text-slate-600">
          Remembered it? <Link to="/login" className="text-brand-700 font-medium hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
