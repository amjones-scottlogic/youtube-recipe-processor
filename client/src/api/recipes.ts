import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Recipe, CreateRecipeRequest } from '../recipes/types';

const BASE_URL = 'http://localhost:3000/api/recipes';

export const useRecipes = () => {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async (): Promise<Recipe[]> => {
      const response = await fetch(BASE_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      return response.json();
    },
  });
};

export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: async (): Promise<Recipe> => {
      const response = await fetch(`${BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }
      return response.json();
    },
    enabled: !!id,
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRecipeRequest) => {
      const response = await fetch(`${BASE_URL}/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: data.youtubeUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to create recipe');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};
