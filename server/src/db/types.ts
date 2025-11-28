export interface RecipeRow {
  id: number;
  title: string;
  description: string;
  ingredients: string; // JSON string
  instructions: string; // JSON string
  prepTime: string;
  cookTime: string;
  servings: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}
