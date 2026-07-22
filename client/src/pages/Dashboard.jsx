import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import * as mealApi from '../api/meal';
import * as waterApi from '../api/water';
import * as userApi from '../api/user';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import { prettyDate, round } from '../utils';

const MACRO_COLORS = { Protein: '#16a34a', Carbs: '#f59e0b', Fat: '#ef4444' };

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [goal, setGoal] = useState(2000);
  const [water, setWater] = useState({ glasses: 0, goal: 8 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, g, w] = await Promise.all([
        mealApi.getDailySummary(),
        userApi.getDailyGoal(),
        waterApi.getWater(),
      ]);
      setSummary(s.data);
      setGoal(g.data.goal.calorieGoal);
      setWater({ glasses: w.data.log?.glasses || 0, goal: w.data.goal || 8 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || !summary) return <Spinner className="py-20" />;

  const t = summary.today;
  const calories = round(t.calories);
  const pct = goal ? Math.round((calories / goal) * 100) : 0;

  const macroData = [
    { name: 'Protein', value: round(t.protein) },
    { name: 'Carbs', value: round(t.carbs) },
    { name: 'Fat', value: round(t.fat) },
  ];

  const weekData = summary.week.map((d) => ({
    date: prettyDate(d.date),
    carbs: round(d.carbs),
    protein: round(d.protein),
    fat: round(d.fat),
  }));

  const streak = (() => {
    let s = 0;
    for (let i = summary.week.length - 1; i >= 0; i--) {
      if (summary.week[i].count > 0) s++;
      else if (i === summary.week.length - 1) continue;
      else break;
    }
    return s;
  })();

  const addGlass = async () => {
    try {
      await waterApi.addWater(1);
      setWater((w) => ({ ...w, glasses: w.glasses + 1 }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/food"><Button variant="secondary" size="sm">+ Log a meal</Button></Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Calories today</p>
          <p className="mt-1 text-3xl font-bold">{calories}</p>
          <p className="text-sm text-slate-500">/ {goal} kcal ({pct}%)</p>
          <ProgressBar value={calories} max={goal} className="mt-3" />
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Daily streak</p>
          <p className="mt-1 text-3xl font-bold">{streak} 🔥</p>
          <p className="text-sm text-slate-500">consecutive days logged</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Water today</p>
          <p className="mt-1 text-3xl font-bold">{water.glasses} 💧</p>
          <p className="text-sm text-slate-500">/ {water.goal} glasses</p>
          <ProgressBar value={water.glasses} max={water.goal} className="mt-3" color="bg-blue-500" />
          <button onClick={addGlass} className="mt-2 text-xs text-brand-600 hover:underline">+1 glass</button>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Meals today</p>
          <p className="mt-1 text-3xl font-bold">
            {t.byType.breakfast.length + t.byType.lunch.length + t.byType.dinner.length + t.byType.snack.length}
          </p>
          <p className="text-sm text-slate-500">items logged</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Macro breakdown</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={macroData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {macroData.map((d) => <Cell key={d.name} fill={MACRO_COLORS[d.name]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            {macroData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: MACRO_COLORS[d.name] }} />
                {d.name}: {d.value}g
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">Last 7 days nutrition</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="carbs" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="protein" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="fat" stroke="#facc15" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
