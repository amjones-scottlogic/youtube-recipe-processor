import React from 'react';
import { Link } from 'react-router-dom';
import { useRecipes, useDeleteRecipe } from '../../api/recipes';
import { Recipe } from '../types';

export const RecipeList: React.FC = () => {
  const { data: recipes, isLoading, error } = useRecipes();
  const deleteRecipe = useDeleteRecipe();

  if (isLoading) return <div>Loading recipes...</div>;
  if (error) return <div>Error loading recipes</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {recipes?.map((recipe: Recipe) => (
        <div key={recipe.id} className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
          <img 
            src={recipe.thumbnailUrl} 
            alt={recipe.title} 
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
          <div className="flex justify-between items-center">
            <Link 
              to={`/recipes/${recipe.id}`}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              View Recipe
            </Link>
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to delete this recipe?')) {
                  deleteRecipe.mutate(recipe.id);
                }
              }}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      {recipes?.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-8">
          No recipes found. Add one to get started!
        </div>
      )}
    </div>
  );
};
