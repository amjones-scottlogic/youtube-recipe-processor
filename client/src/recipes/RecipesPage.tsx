import { useState } from 'react';
import { RecipeList } from './components/RecipeList';
import { AddRecipeModal } from './components/AddRecipeModal';

export function RecipesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Recipes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Recipe
        </button>
      </div>
      
      <RecipeList />
      
      <AddRecipeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
