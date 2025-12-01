export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}

export interface CreateRecipeRequest {
  youtubeUrl: string;
}
