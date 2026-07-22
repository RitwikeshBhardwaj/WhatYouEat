import { useEffect, useState } from 'react';
import * as userApi from '../api/user';
import * as waterApi from '../api/water';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { prettyDate } from '../utils';

const ACTIVITY_FACTOR = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};

export default function Health() {
  const [user, setUser] = useState(null);
  const [water, setWater] = useState({ glasses: 0, goal: 8 });
  const [waterWeek, setWaterWeek] = useState([]);
  const [form, setForm] = useState({ heightCm: '', weightKg: '', age: '', activityLevel: 'sedentary', gender: 'other' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, w, ww] = await Promise.all([
          userApi.getProfile(),
          waterApi.getWater(),
          waterApi.getWaterWeek(),
        ]);
        setUser(p.data.user);
        setWater({ glasses: w.data.log?.glasses || 0, goal: w.data.goal || 8 });
        setWaterWeek(ww.data.days || []);
        const pr = p.data.user.profile || {};
        setForm({
          heightCm: pr.heightCm || '',
          weightKg: pr.weightKg || '',
          age: pr.age || '',
          activityLevel: pr.activityLevel || 'sedentary',
          gender: pr.gender || 'other',
        });
      } catch {}
    })();
  }, []);

  const heightM = Number(form.heightCm) / 100;
  const weight = Number(form.weightKg);
  const bmi = heightM > 0 && weight > 0 ? weight / (heightM * heightM) : 0;

  const bmiCat = bmi === 0 ? '—' :
    bmi < 18.5 ? 'Underweight' :
    bmi < 25 ? 'Healthy' :
    bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor = bmi === 0 ? 'gray' :
    bmi < 18.5 ? 'blue' :
    bmi < 25 ? 'green' :
    bmi < 30 ? 'amber' : 'red';

  const tdee = (() => {
    const h = Number(form.heightCm), w = Number(form.weightKg), a = Number(form.age);
    if (!h || !w || !a) return 0;
    let bmr;
    if (form.gender === 'male') bmr = 10 * w + 6.25 * h - 5 * a + 5;
    else if (form.gender === 'female') bmr = 10 * w + 6.25 * h - 5 * a - 161;
    else bmr = 10 * w + 6.25 * h - 5 * a - 78;
    return Math.round(bmr * (ACTIVITY_FACTOR[form.activityLevel] || 1.2));
  })();

  const addGlass = async (delta) => {
    setBusy(true);
    try {
      const res = await waterApi.addWater(delta);
      setWater({ glasses: res.data.log.glasses, goal: water.goal });
    } finally { setBusy(false); }
  };

  const onForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const saveProfile = async () => {
    setBusy(true);
    try {
      const res = await userApi.updateProfile({
        profile: {
          heightCm: Number(form.heightCm) || undefined,
          weightKg: Number(form.weightKg) || undefined,
          age: Number(form.age) || undefined,
          activityLevel: form.activityLevel,
          gender: form.gender,
        },
      });
      setUser(res.data.user);
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Health insights</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Your metrics</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input name="heightCm" type="number" label="Height (cm)" value={form.heightCm} onChange={onForm} />
            <Input name="weightKg" type="number" label="Weight (kg)" value={form.weightKg} onChange={onForm} />
            <Input name="age" type="number" label="Age" value={form.age} onChange={onForm} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Activity level</label>
              <select name="activityLevel" value={form.activityLevel} onChange={onForm} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly active</option>
                <option value="moderate">Moderately active</option>
                <option value="active">Active</option>
                <option value="very_active">Very active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={onForm} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="other">Other</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <Button className="mt-4" onClick={saveProfile} disabled={busy}>Save metrics</Button>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold">BMI</h2>
            <p className="mt-2 text-3xl font-bold">{bmi ? bmi.toFixed(1) : '—'}</p>
            <p className={`text-sm text-${bmiColor}-600`}>{bmiCat}</p>
          </Card>
          <Card>
            <h2 className="font-semibold">TDEE</h2>
            <p className="mt-2 text-3xl font-bold">{tdee ? tdee : '—'} <span className="text-base font-normal text-slate-500">kcal/day</span></p>
            <p className="text-sm text-slate-500">
              {tdee ? `Maintenance ≈ ${tdee} kcal · For weight loss aim ~${tdee - 500} kcal/day` : 'Fill metrics to calculate'}
            </p>
          </Card>
        </div>
      </div>

      <Card>
        <h2 className="font-semibold">Water tracker</h2>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{water.glasses} 💧</p>
            <p className="text-sm text-slate-500">/ {water.goal} glasses today</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => addGlass(-1)} disabled={busy || water.glasses <= 0}>−1</Button>
            <Button onClick={() => addGlass(1)} disabled={busy}>+1</Button>
          </div>
        </div>
        <ProgressBar value={water.glasses} max={water.goal} className="mt-4" color="bg-blue-500" />
      </Card>

      {waterWeek.length > 0 && (
        <Card>
          <h2 className="font-semibold">Water — last 7 days</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterWeek.map((d) => ({ date: prettyDate(d.date), glasses: d.glasses }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="glasses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
