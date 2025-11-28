import db from '../db/client';
import { Recipe } from './types';
import { RecipeRow } from '../db/types';
import { extractRecipe, getVideoMetadata } from './ai';

export const getRecipes = (): Recipe[] => {
  const recipes = db.query("SELECT * FROM recipes ORDER BY createdAt DESC").all() as RecipeRow[];
  return recipes.map((r) => ({
    ...r,
    ingredients: JSON.parse(r.ingredients),
    instructions: JSON.parse(r.instructions)
  }));
};

export const getRecipeById = (id: string): Recipe | null => {
  const recipe = db.query("SELECT * FROM recipes WHERE id = ?").get(id) as RecipeRow | undefined;
  if (!recipe) return null;
  return {
    ...recipe,
    ingredients: JSON.parse(recipe.ingredients),
    instructions: JSON.parse(recipe.instructions)
  };
};

export const createRecipeFromUrl = async (url: string): Promise<Recipe> => {
  const [recipeData, metadata] = await Promise.all([
    extractRecipe(url),
    getVideoMetadata(url)
  ]);

  const result = db.run(`
    INSERT INTO recipes (title, description, ingredients, instructions, prepTime, cookTime, servings, youtubeUrl, thumbnailUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    recipeData.title,
    recipeData.description,
    JSON.stringify(recipeData.ingredients),
    JSON.stringify(recipeData.instructions),
    recipeData.prepTime || "",
    recipeData.cookTime || "",
    recipeData.servings || "",
    url,
    metadata.thumbnailUrl
  ]);

  const newRecipe = db.query("SELECT * FROM recipes WHERE id = ?").get(result.lastInsertRowid) as RecipeRow;

  return {
    ...newRecipe,
    ingredients: JSON.parse(newRecipe.ingredients),
    instructions: JSON.parse(newRecipe.instructions)
  };
};

export const deleteRecipe = (id: string): void => {
  db.run("DELETE FROM recipes WHERE id = ?", [id]);
};
