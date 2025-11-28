import { RecipeRow } from '../db/types';

export interface Recipe extends Omit<RecipeRow, 'ingredients' | 'instructions'> {
  ingredients: string[];
  instructions: string[];
}
