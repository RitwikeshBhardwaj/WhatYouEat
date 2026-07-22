import { useState } from 'react';
import * as recipeApi from '../api/recipe';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';

export default function Recipe() {
  const [input, setInput] = useState('');
  const [servings, setServings] = useState(8);
  const type = 'text';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const res = await recipeApi.analyzeRecipe(input, type, servings);
      setData(res.data.recipe);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Recipe analyzer</h1>

      <Card>
        <form onSubmit={analyze} className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            placeholder={"2 cups flour\n1 cup sugar\n3 eggs\n1/2 cup butter"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="servings" className="text-sm text-slate-600">Servings</label>
            <input
              id="servings"
              type="number"
              min="1"
              max="20"
              value={servings}
              onChange={(e) => setServings(Number(e.target.value) || 1)}
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" disabled={loading}>{loading ? 'Analyzing…' : 'Analyze recipe'}</Button>
        </form>
      </Card>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && <Spinner className="py-10" />}

      {data && !loading && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{data.label}</h2>
                {data.source && <p className="text-sm text-slate-500">Source: {data.source}</p>}
                {data.yield && <p className="text-sm text-slate-500">Serves {data.yield}</p>}
              </div>
              {data.image && <img src={data.image} alt={data.label} className="h-20 w-20 rounded-lg object-cover" />}
            </div>
            {data.healthLabels?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {data.healthLabels.slice(0, 12).map((h) => <Badge key={h} color="green">{h}</Badge>)}
              </div>
            )}
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h3 className="font-semibold">Total nutrition</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Calories: {data.totalNutrition.calories}</li>
                <li>Protein: {data.totalNutrition.protein}g</li>
                <li>Carbs: {data.totalNutrition.carbs}g</li>
                <li>Fat: {data.totalNutrition.fat}g</li>
                {data.totalNutrition.fiber !== undefined && <li>Fiber: {data.totalNutrition.fiber}g</li>}
                {data.totalNutrition.sugar !== undefined && <li>Sugar: {data.totalNutrition.sugar}g</li>}
              </ul>
            </Card>
            <Card>
              <h3 className="font-semibold">Per serving</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Calories: {data.perServing.calories}</li>
                <li>Protein: {data.perServing.protein}g</li>
                <li>Carbs: {data.perServing.carbs}g</li>
                <li>Fat: {data.perServing.fat}g</li>
              </ul>
            </Card>
          </div>

          {data.ingredients?.length > 0 && (
            <Card>
              <h3 className="font-semibold">Ingredients</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {data.ingredients.map((ing, i) => (
                  <li key={i} className="text-slate-700">
                    {ing.text || `${ing.quantity || ''} ${ing.food || ''}`}
                    {ing.weight ? <span className="text-slate-400"> ({Math.round(ing.weight)}g)</span> : null}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {data.note && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">{data.note}</p>}
        </div>
      )}
    </div>
  );
}
