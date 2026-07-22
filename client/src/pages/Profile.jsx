import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as userApi from '../api/user';
import Input from '../components/common/Input';
import PhoneInput from '../components/common/PhoneInput';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const ACTIVITY = [
  { v: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { v: 'light', label: 'Lightly active (1-3 days/week)' },
  { v: 'moderate', label: 'Moderately active (3-5 days/week)' },
  { v: 'active', label: 'Active (6-7 days/week)' },
  { v: 'very_active', label: 'Very active (daily/intense)' },
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '', phone: user?.phone || '',
    heightCm: user?.profile?.heightCm || '', weightKg: user?.profile?.weightKg || '',
    age: user?.profile?.age || '', activityLevel: user?.profile?.activityLevel || 'sedentary',
    gender: user?.profile?.gender || 'other',
  });
  const [goal, setGoal] = useState({ calorieGoal: 2000, waterGoal: 8 });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userApi.getDailyGoal().then((res) => {
      setGoal({ calorieGoal: res.data.goal.calorieGoal, waterGoal: res.data.goal.waterGoal });
    }).catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const res = await userApi.updateProfile({
        name: profile.name, phone: profile.phone,
        profile: {
          heightCm: Number(profile.heightCm) || undefined,
          weightKg: Number(profile.weightKg) || undefined,
          age: Number(profile.age) || undefined,
          activityLevel: profile.activityLevel,
          gender: profile.gender,
        },
      });
      updateUser(res.data.user);
      setMsg('Profile saved.');
    } catch (err) {
      setMsg(err.message);
    } finally { setLoading(false); }
  };

  const saveGoal = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await userApi.setDailyGoal({ calorieGoal: Number(goal.calorieGoal), waterGoal: Number(goal.waterGoal) });
      setMsg('Daily goal saved.');
    } catch (err) {
      setMsg(err.message);
    } finally { setLoading(false); }
  };

  const onP = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const onG = (e) => setGoal({ ...goal, [e.target.name]: e.target.value });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <h2 className="font-semibold">Account & health details</h2>
        <form onSubmit={saveProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input name="name" label="Name" value={profile.name} onChange={onP} />
          <PhoneInput name="phone" label="Phone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
          <Input name="heightCm" type="number" label="Height (cm)" value={profile.heightCm} onChange={onP} />
          <Input name="weightKg" type="number" label="Weight (kg)" value={profile.weightKg} onChange={onP} />
          <Input name="age" type="number" label="Age" value={profile.age} onChange={onP} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Activity level</label>
            <select name="activityLevel" value={profile.activityLevel} onChange={onP}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {ACTIVITY.map((a) => <option key={a.v} value={a.v}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
            <select name="gender" value={profile.gender} onChange={onP}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="other">Other</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>Save profile</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-semibold">Daily goals</h2>
        <form onSubmit={saveGoal} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input name="calorieGoal" type="number" label="Calorie goal (kcal/day)" value={goal.calorieGoal} onChange={onG} />
          <Input name="waterGoal" type="number" label="Water goal (glasses/day)" value={goal.waterGoal} onChange={onG} />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>Save goal</Button>
          </div>
        </form>
      </Card>

      {msg && <p className="rounded-md bg-brand-50 p-3 text-sm text-brand-700">{msg}</p>}
    </div>
  );
}
