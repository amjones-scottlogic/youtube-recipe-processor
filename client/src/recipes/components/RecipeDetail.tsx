import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRecipe } from '../../api/recipes';

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: recipe, isLoading, error } = useRecipe(id!);

  if (isLoading) return <div>Loading recipe...</div>;
  if (error) return <div>Error loading recipe</div>;
  if (!recipe) return <div>Recipe not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Recipes</Link>
      
      <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
      
      <div className="mb-6">
        <img 
          src={recipe.thumbnailUrl} 
          alt={recipe.title} 
          className="w-full h-64 object-cover rounded-lg shadow-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="font-semibold block text-gray-700">Prep Time</span>
          {recipe.prepTime}
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="font-semibold block text-gray-700">Cook Time</span>
          {recipe.cookTime}
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="font-semibold block text-gray-700">Servings</span>
          {recipe.servings}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="list-disc list-inside space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">{ingredient}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-4">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="text-gray-700 pl-2">
                <span className="ml-2">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t">
        <a 
          href={recipe.youtubeUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-red-600 hover:text-red-800 font-medium flex items-center gap-2"
        >
          Watch on YouTube
        </a>
      </div>
    </div>
  );
};
