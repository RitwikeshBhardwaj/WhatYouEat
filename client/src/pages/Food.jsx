import { useState } from 'react';
import * as foodApi from '../api/food';
import * as mealApi from '../api/meal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function Food() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(null);
  const [portion, setPortion] = useState(1);
  const [mealType, setMealType] = useState('breakfast');
  const [msg, setMsg] = useState('');

  const search = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true); setError(''); setResults(null);
    try {
      const res = await foodApi.searchFood(q);
      setResults(res.data);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const startAdd = (item) => {
    setAdding(item);
    setPortion(1);
    setMealType('breakfast');
    setMsg('');
  };

  const confirmAdd = async () => {
    if (!adding) return;
    setLoading(true);
    try {
      await mealApi.createMeal({
        mealType,
        label: adding.label,
        foodId: adding.foodId,
        source: 'usda',
        portion: Number(portion),
        portionUnit: 'serving',
        nutrition: adding.nutrition,
      });
      setMsg(`Added "${adding.label}" to ${mealType}.`);
      setAdding(null);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const badgeColor = (label) => {
    if (/protein/i.test(label)) return 'green';
    if (/sugar/i.test(label)) return 'amber';
    if (/fat/i.test(label)) return 'red';
    if (/fiber|calcium|iron/i.test(label)) return 'blue';
    return 'gray';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Food search</h1>

      <form onSubmit={search} className="flex gap-2">
        <div className="flex-1">
          <Input name="q" placeholder="Search any food…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading}>{loading ? 'Searching…' : 'Search'}</Button>
      </form>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {msg && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{msg}</p>}
      {loading && !results && <Spinner className="py-10" />}

      {adding && (
        <Card>
          <h2 className="font-semibold">Log: {adding.label}</h2>
          <p className="text-sm text-slate-500">Per serving: {adding.nutrition.calories} kcal · P {adding.nutrition.protein}g · C {adding.nutrition.carbs}g · F {adding.nutrition.fat}g</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meal type</label>
              <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {MEAL_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <Input type="number" step="0.1" min="0.1" label="Portion (servings)" value={portion} onChange={(e) => setPortion(e.target.value)} />
          </div>
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
            Totals: {Math.round(adding.nutrition.calories * portion)} kcal · P {Math.round(adding.nutrition.protein * portion * 10) / 10}g · C {Math.round(adding.nutrition.carbs * portion * 10) / 10}g · F {Math.round(adding.nutrition.fat * portion * 10) / 10}g
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={confirmAdd} disabled={loading}>Confirm</Button>
            <Button variant="ghost" onClick={() => setAdding(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      {results && !adding && (
        <div className="grid gap-3">
          {results.items.length === 0 && <p className="text-sm text-slate-500">No results.</p>}
          {results.items.map((item) => (
            <Card key={item.foodId || item.label} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-slate-500">
                  {item.nutrition.calories} kcal · P {item.nutrition.protein}g · C {item.nutrition.carbs}g · F {item.nutrition.fat}g
                  {item.category ? ` · ${item.category}` : ''}
                </p>
                {item.badges?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.badges.slice(0, 6).map((b) => (
                      <Badge key={b} color={badgeColor(b)}>{b}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="secondary" onClick={() => startAdd(item)}>+ Log</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
