import { http, HttpResponse, delay } from 'msw';
import { Recipe } from '../recipes/types';

const mockRecipes: Recipe[] = [
  {
    id: 1,
    title: 'Spaghetti Carbonara',
    description: 'A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.',
    ingredients: [
      '400g spaghetti',
      '200g pancetta',
      '4 large eggs',
      '100g Pecorino Romano',
      'Black pepper'
    ],
    instructions: [
      'Boil pasta.',
      'Fry pancetta.',
      'Mix eggs and cheese.',
      'Combine everything.'
    ],
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: '4',
    youtubeUrl: 'https://www.youtube.com/watch?v=3AAdKl1UYZs',
    thumbnailUrl: 'https://i.ytimg.com/vi/3AAdKl1UYZs/maxresdefault.jpg',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Chicken Tikka Masala',
    description: 'Chunks of roasted marinated chicken (chicken tikka) in a spiced curry sauce.',
    ingredients: [
      'Chicken breast',
      'Yogurt',
      'Spices',
      'Tomato sauce',
      'Cream'
    ],
    instructions: [
      'Marinate chicken.',
      'Grill chicken.',
      'Make sauce.',
      'Simmer chicken in sauce.'
    ],
    prepTime: '20 mins',
    cookTime: '30 mins',
    servings: '4',
    youtubeUrl: 'https://www.youtube.com/watch?v=example',
    thumbnailUrl: 'https://via.placeholder.com/640x360',
    createdAt: new Date().toISOString(),
  }
];

export const handlers = [
  http.get('http://localhost:3000/api/recipes', async () => {
    await delay(500);
    return HttpResponse.json(mockRecipes);
  }),

  http.get('http://localhost:3000/api/recipes/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const recipe = mockRecipes.find((r) => r.id === Number(id));
    
    if (!recipe) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(recipe);
  }),

  http.post('http://localhost:3000/api/recipes/parse', async ({ request }) => {
    await delay(2000); // Simulate AI processing time
    const body = await request.json() as { url: string };
    
    const newRecipe: Recipe = {
      id: Math.floor(Math.random() * 10000),
      title: 'Mocked AI Recipe',
      description: `This is a mocked recipe generated from ${body.url}`,
      ingredients: ['Mock Ingredient 1', 'Mock Ingredient 2'],
      instructions: ['Mock Step 1', 'Mock Step 2'],
      prepTime: '5 mins',
      cookTime: '10 mins',
      servings: '2',
      youtubeUrl: body.url,
      thumbnailUrl: 'https://via.placeholder.com/640x360',
      createdAt: new Date().toISOString(),
    };

    // In a real mock we might want to add it to the list, but for now just returning it is enough
    // as the query cache will be invalidated and refetch the list (which is static here unless we modify it)
    // Let's modify the static list to make it feel real
    mockRecipes.push(newRecipe);

    return HttpResponse.json(newRecipe);
  }),

  http.delete('http://localhost:3000/api/recipes/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const index = mockRecipes.findIndex((r) => r.id === Number(id));
    
    if (index !== -1) {
      mockRecipes.splice(index, 1);
    }
    
    return HttpResponse.json({ success: true });
  }),
];
