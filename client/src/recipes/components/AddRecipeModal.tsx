import React, { useState } from 'react';
import { useCreateRecipe } from '../../api/recipes';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const createRecipe = useCreateRecipe();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRecipe.mutateAsync({ youtubeUrl: url });
      setUrl('');
      onClose();
    } catch (error) {
      console.error('Failed to create recipe:', error);
      // Ideally show error to user
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Recipe</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-1">
              YouTube URL
            </label>
            <input
              type="url"
              id="youtubeUrl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {createRecipe.isError && (
            <div className="mb-4 text-red-500 text-sm">
              Failed to process video. Please try again.
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={createRecipe.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              disabled={createRecipe.isPending}
            >
              {createRecipe.isPending ? 'Processing...' : 'Add Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
