import { useEffect, useState } from 'react';
import * as customApi from '../api/customFood';
import * as mealApi from '../api/meal';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function CustomFoods() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState({ name: '', servingSize: '1 serving', calories: '', protein: '', carbs: '', fat: '', mealType: 'snack' });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedMealTypes, setSelectedMealTypes] = useState({});

  const load = async () => {
    try {
      const res = await customApi.getCustomFoods();
      setFoods(res.data.foods);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setForm({ name: '', servingSize: '1 serving', calories: '', protein: '', carbs: '', fat: '', mealType: 'snack' });
    setEditing(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg('');
    const payload = {
      name: form.name,
      servingSize: form.servingSize,
      nutrition: {
        calories: Number(form.calories) || 0,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
      },
    };
    try {
      if (editing) {
        await customApi.updateCustomFood(editing, payload);
        setMsg('Updated.');
      } else {
        const created = await customApi.createCustomFood(payload);
        await mealApi.createMeal({
          mealType: form.mealType || 'snack',
          label: form.name,
          source: 'custom',
          portion: 1,
          nutrition: {
            calories: Number(form.calories) || 0,
            protein: Number(form.protein) || 0,
            carbs: Number(form.carbs) || 0,
            fat: Number(form.fat) || 0,
          },
        });
        setMsg(`Custom food added and logged as a ${form.mealType || 'snack'}.`);
        if (created?.data?.food) {
          setSelectedMealTypes((prev) => ({ ...prev, [created.data.food._id]: form.mealType || 'snack' }));
        }
      }
      reset();
      await load();
    } catch (err) {
      setMsg(err.message);
    } finally { setBusy(false); }
  };

  const edit = (f) => {
    setEditing(f._id);
    setForm({
      name: f.name, servingSize: f.servingSize,
      calories: f.nutrition.calories, protein: f.nutrition.protein,
      carbs: f.nutrition.carbs, fat: f.nutrition.fat,
      mealType: selectedMealTypes[f._id] || 'snack',
    });
  };

  const remove = async (id) => {
    if (!confirm('Delete this custom food?')) return;
    await customApi.deleteCustomFood(id);
    await load();
  };

  const logMeal = async (f) => {
    const mealType = selectedMealTypes[f._id] || 'snack';
    setBusy(true); setMsg('');
    try {
      await mealApi.createMeal({
        mealType,
        label: f.name,
        source: 'custom',
        portion: 1,
        nutrition: f.nutrition,
      });
      setMsg(`Logged "${f.name}" as a ${mealType}.`);
    } catch (err) {
      setMsg(err.message);
    } finally { setBusy(false); }
  };

  const on = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const updateMealType = (foodId, mealType) => {
    setSelectedMealTypes((prev) => ({ ...prev, [foodId]: mealType }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Custom foods</h1>

      <Card>
        <h2 className="font-semibold">{editing ? 'Edit custom food' : 'Add custom food'}</h2>
        <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input name="name" label="Name" required value={form.name} onChange={on} />
          <Input name="servingSize" label="Serving size" value={form.servingSize} onChange={on} />
          <Input name="calories" type="number" label="Calories" required value={form.calories} onChange={on} />
          <Input name="protein" type="number" label="Protein (g)" value={form.protein} onChange={on} />
          <Input name="carbs" type="number" label="Carbs (g)" value={form.carbs} onChange={on} />
          <Input name="fat" type="number" label="Fat (g)" value={form.fat} onChange={on} />
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Default meal type</label>
            <select
              name="mealType"
              value={form.mealType}
              onChange={on}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {MEAL_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" disabled={busy}>{editing ? 'Update' : 'Add'} food</Button>
            {editing && <Button type="button" variant="ghost" onClick={reset}>Cancel</Button>}
          </div>
        </form>
      </Card>

      {msg && <p className="rounded-md bg-brand-50 p-3 text-sm text-brand-700">{msg}</p>}

      <div className="grid gap-3">
        {foods.length === 0 && <p className="text-sm text-slate-500">No custom foods yet.</p>}
        {foods.map((f) => (
          <Card key={f._id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{f.name}</p>
              <p className="text-sm text-slate-500">
                {f.nutrition.calories} kcal · P {f.nutrition.protein}g · C {f.nutrition.carbs}g · F {f.nutrition.fat}g
                <span className="text-slate-400"> · {f.servingSize}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="brand">custom</Badge>
              <select
                value={selectedMealTypes[f._id] || 'snack'}
                onChange={(e) => updateMealType(f._id, e.target.value)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
              >
                {MEAL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <Button variant="ghost" onClick={() => logMeal(f)} disabled={busy}>+ Log</Button>
              <Button variant="secondary" onClick={() => edit(f)}>Edit</Button>
              <button onClick={() => remove(f._id)} className="text-sm text-red-500 hover:underline">Delete</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
