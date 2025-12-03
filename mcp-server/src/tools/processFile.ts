import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";

const API_KEY = process.env.GEMINI_API_KEY;

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".mp4": return "video/mp4";
    case ".mov": return "video/quicktime";
    case ".avi": return "video/x-msvideo";
    case ".wmv": return "video/x-ms-wmv";
    case ".mpg":
    case ".mpeg": return "video/mpeg";
    case ".webm": return "video/webm";
    default: return "video/mp4";
  }
}

export function registerProcessFile(server: McpServer) {
  server.tool(
    "processFile",
    "Processes a video file with Gemini 3 using a given prompt.",
    {
      filePath: z.string().describe("The absolute path to the video file"),
      prompt: z.string().describe("The prompt to send to Gemini"),
    },
    async ({ filePath, prompt }) => {
      if (!API_KEY) {
        return {
          isError: true,
          content: [{ type: "text", text: "GEMINI_API_KEY environment variable is not set." }],
        };
      }

      const mimeType = getMimeType(filePath);

      try {
        console.error(`Uploading ${filePath} to Gemini...`);
        const fileManager = new GoogleAIFileManager(API_KEY);
        const uploadResult = await fileManager.uploadFile(filePath, {
          mimeType,
          displayName: path.basename(filePath),
        });

        console.error(`Uploaded file: ${uploadResult.file.uri}. Waiting for processing...`);

        let file = await fileManager.getFile(uploadResult.file.name);
        while (file.state === FileState.PROCESSING) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          file = await fileManager.getFile(uploadResult.file.name);
        }

        if (file.state === FileState.FAILED) {
          return {
            isError: true,
            content: [{ type: "text", text: "Video processing failed." }],
          };
        }

        console.error(`File processed. Generating content...`);

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

        const result = await model.generateContent([
          {
            fileData: {
              mimeType: file.mimeType,
              fileUri: file.uri,
            },
          },
          { text: prompt },
        ]);

        return {
          content: [
            {
              type: "text",
              text: result.response.text(),
            },
          ],
        };

      } catch (error: any) {
        console.error("Error processing file:", error);
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${error.message}` }],
        };
      }
    }
  );
}
