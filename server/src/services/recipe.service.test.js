import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIngredientLine, scaleNutritionToAmount } from './recipe.service.js';

test('parseIngredientLine splits quantity, unit, and ingredient text', () => {
  const parsed = parseIngredientLine('2 cups flour');

  assert.equal(parsed.quantity, 2);
  assert.equal(parsed.unit, 'cup');
  assert.equal(parsed.ingredient, 'flour');
});

test('scaleNutritionToAmount uses the parsed amount to keep nutrition conservative', () => {
  const scaled = scaleNutritionToAmount(
    { calories: 100, protein: 10, carbs: 20, fat: 5, fiber: 2, sugar: 1 },
    { quantity: 2, unit: 'cup', ingredient: 'flour' }
  );

  assert.ok(scaled.calories < 100);
  assert.ok(scaled.protein < 10);
  assert.ok(scaled.carbs < 20);
});
