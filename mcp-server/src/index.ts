import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import chokidar from "chokidar";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";

const server = new McpServer({
  name: "file-watcher-mcp",
  version: "1.0.0",
});

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
    default: return "video/mp4"; // Default to mp4 if unknown
  }
}

server.tool(
  "waitForFileType",
  "Polls a directory waiting for a file with a specific extension to appear, then processes it with Gemini 3.",
  {
    extension: z.string().describe("The file extension to wait for (e.g. .mp4)"),
    prompt: z.string().describe("The prompt to send to Gemini with the video"),
    timeoutMs: z.number().optional().describe("Timeout in milliseconds (default 60000)"),
  },
  async ({ extension, prompt, timeoutMs }) => {
    if (!API_KEY) {
      return {
        isError: true,
        content: [{ type: "text", text: "GEMINI_API_KEY environment variable is not set." }],
      };
    }

    const directory = "C:\\Users\\amjones\\Downloads";
    const timeout = timeoutMs ?? 600000;
    const targetPattern = extension.startsWith(".") ? `*${extension}` : `*.${extension}`;
    // Convert backslashes to forward slashes for glob compatibility
    const watchGlob = path.join(directory, targetPattern).replace(/\\/g, "/");

    // Log to stderr so it doesn't interfere with JSON-RPC on stdout
    console.error(`Watching directory: ${directory} for extension: ${extension}`);

    return new Promise((resolve) => {
      const watcher = chokidar.watch(directory, {
        ignoreInitial: true, // Do not trigger for existing files
        depth: 0, // Non-recursive
        persistent: true,
        usePolling: true,
        interval: 1000,
      });

      watcher.on("all", (event, filePath) => {
        // console.error(`Chokidar event: ${event} on ${filePath}`);
      });

      const timer = setTimeout(() => {
        watcher.close();
        resolve({
          isError: true,
          content: [
            {
              type: "text",
              text: `Timeout waiting for file with extension ${extension} in ${directory}`,
            },
          ],
        });
      }, timeout);

      watcher.on("add", async (filePath) => {
        // Check if file matches extension
        if (!filePath.endsWith(extension)) {
            return;
        }

        console.error(`File found: ${filePath}`);
        clearTimeout(timer);
        watcher.close();
        
        // filePath might be absolute or relative. 
        // If relative, join with directory.
        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(directory, filePath);
        const mimeType = getMimeType(fullPath);

        try {
          console.log("Uploading to Gemini...");
          const fileManager = new GoogleAIFileManager(API_KEY);
          const uploadResult = await fileManager.uploadFile(fullPath, {
            mimeType,
            displayName: filePath,
          });

          console.log(`Uploaded file: ${uploadResult.file.uri}. Waiting for processing...`);

          let file = await fileManager.getFile(uploadResult.file.name);
          while (file.state === FileState.PROCESSING) {
             await new Promise((r) => setTimeout(r, 2000));
             file = await fileManager.getFile(uploadResult.file.name);
          }

          if (file.state === FileState.FAILED) {
             throw new Error("Video processing failed.");
          }

          console.error(`File processed. Generating content...`);

          const genAI = new GoogleGenerativeAI(API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
          
          const result = await model.generateContent([
            prompt,
            {
              fileData: {
                fileUri: file.uri,
                mimeType: file.mimeType,
              },
            },
          ]);

          const responseText = result.response.text();

          resolve({
            content: [
              {
                type: "text",
                text: responseText,
              },
            ],
          });

        } catch (error) {
           console.error("Error processing with Gemini:", error);
           resolve({
             isError: true,
             content: [{ type: "text", text: `Error processing file: ${error}` }],
           });
        }
      });

      watcher.on("error", (error) => {
        console.error(`Watcher error: ${error}`);
        // Don't resolve here, let it keep trying or timeout? 
        // Or fail? Let's fail if watcher crashes.
        clearTimeout(timer);
        watcher.close();
        resolve({
            isError: true,
            content: [{ type: "text", text: `Watcher error: ${error}` }]
        });
      });
    });
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
