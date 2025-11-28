import { Hono } from 'hono';
import * as recipeService from './service';

const recipes = new Hono();

// Get all recipes
recipes.get('/', (c) => {
  const allRecipes = recipeService.getRecipes();
  return c.json(allRecipes);
});

// Get recipe by ID
recipes.get('/:id', (c) => {
  const id = c.req.param('id');
  const recipe = recipeService.getRecipeById(id);
  
  if (!recipe) return c.json({ error: "Recipe not found" }, 404);

  return c.json(recipe);
});

// Parse and save recipe
recipes.post('/parse', async (c) => {
  const { url } = await c.req.json<{ url: string }>();
  
  if (!url) return c.json({ error: "URL is required" }, 400);

  try {
    const newRecipe = await recipeService.createRecipeFromUrl(url);
    return c.json(newRecipe);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to process video" }, 500);
  }
});

// Delete recipe
recipes.delete('/:id', (c) => {
  const id = c.req.param('id');
  recipeService.deleteRecipe(id);
  return c.json({ success: true });
});

export default recipes;
