import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_NAME = "gemini-3.0-pro-001";

export const RecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.string().optional(),
});

export type RecipeData = z.infer<typeof RecipeSchema>;

export async function getVideoMetadata(url: string): Promise<{ originalTitle: string; thumbnailUrl: string }> {
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        const titleMatch = html.match(/<meta property="og:title" content="(.*?)"/);
        const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/);
        
        return {
            originalTitle: titleMatch ? titleMatch[1] : "Unknown Video",
            thumbnailUrl: imageMatch ? imageMatch[1] : ""
        };
    } catch (e) {
        console.error("Error fetching video metadata", e);
        return { originalTitle: "Unknown Video", thumbnailUrl: "" };
    }
}

export async function extractRecipe(youtubeUrl: string): Promise<RecipeData> {
  try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: { responseMimeType: "application/json" } });

      const prompt = `
        You are a cooking assistant. Extract a structured recipe from the following YouTube video.
        Video URL: ${youtubeUrl}

        If the video does not contain a recipe, return a JSON with empty fields but do not error.
        Return the result in JSON format matching this structure:
        {
          "title": "Recipe Title",
          "description": "Brief description",
          "ingredients": ["ingredient 1", "ingredient 2"],
          "instructions": ["step 1", "step 2"],
          "prepTime": "10 mins",
          "cookTime": "20 mins",
          "servings": "4"
        }
      `; 

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const json = JSON.parse(text);
      return RecipeSchema.parse(json);
  } catch (error) {
      console.error("Error extracting recipe:", error);
      throw new Error("Failed to extract recipe from video.");
  }
}
