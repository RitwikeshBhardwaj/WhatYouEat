import { useEffect, useState } from 'react';
import * as mealApi from '../api/meal';
import * as exportApi from '../api/export';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { prettyDate } from '../utils';

const MEAL_COLORS = { breakfast: 'amber', lunch: 'blue', dinner: 'brand', snack: 'gray' };

export default function Meals() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await mealApi.getDailySummary();
      setSummary(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    setBusy(true);
    try {
      await mealApi.deleteMeal(id);
      await load();
    } finally { setBusy(false); }
  };

  const downloadPdf = async () => {
    setBusy(true);
    try {
      const res = await exportApi.exportWeekly();
      const url = window.URL.createObjectURL(new Blob([res]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `whatyoueat-weekly.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally { setBusy(false); }
  };

  if (loading || !summary) return <Spinner className="py-20" />;

  const t = summary.today;
  const types = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Today's meals</h1>
        <Button variant="secondary" onClick={downloadPdf} disabled={busy}>📄 Export week (PDF)</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Calories</p>
          <p className="text-2xl font-bold">{Math.round(t.calories)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Protein</p>
          <p className="text-2xl font-bold">{Math.round(t.protein)}g</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Carbs</p>
          <p className="text-2xl font-bold">{Math.round(t.carbs)}g</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Fat</p>
          <p className="text-2xl font-bold">{Math.round(t.fat)}g</p>
        </Card>
      </div>

      {types.map((mt) => (
        <Card key={mt}>
          <div className="flex items-center gap-2">
            <Badge color={MEAL_COLORS[mt]}>{mt}</Badge>
            <span className="text-sm text-slate-500">{t.byType[mt].length} item(s)</span>
          </div>
          {t.byType[mt].length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Nothing logged.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {t.byType[mt].map((m) => (
                <li key={m._id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-slate-500">
                      {m.nutrition.calories} kcal · P {m.nutrition.protein}g · C {m.nutrition.carbs}g · F {m.nutrition.fat}g · ×{m.portion}
                    </p>
                  </div>
                  <button onClick={() => remove(m._id)} disabled={busy} className="text-xs text-red-500 hover:underline">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}

      <Card>
        <h2 className="font-semibold">Last 7 days</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {summary.week.map((d) => (
            <li key={d.date} className="flex items-center justify-between py-2 text-sm">
              <span>{prettyDate(d.date)}</span>
              <span className="text-slate-500">
                {d.calories} kcal · {d.count} item(s)
                {d.count > 0 ? ' ✅' : ' —'}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
