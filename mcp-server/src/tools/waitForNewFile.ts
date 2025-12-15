import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import chokidar from "chokidar";
import path from "node:path";
import os from "node:os";

const WATCH_DIR = path.join(os.homedir(), "Downloads");
const DEFAULT_ALLOWED_EXTENSIONS = [".mp4", ".mov", ".avi", ".wmv", ".mpg", ".mpeg", ".webm"];

export function registerWaitForNewFile(server: McpServer) {
  server.tool(
    "waitForNewFile",
    "Waits for a new file to appear in the downloads directory.",
    {
      timeoutMs: z.number().optional().describe("Timeout in milliseconds (default 60000)"),
      allowedExtensions: z.array(z.string()).optional().describe("List of allowed file extensions (e.g. ['.mp4', '.txt']). Defaults to video extensions."),
    },
    async ({ timeoutMs, allowedExtensions }) => {
      const timeout = timeoutMs ?? 60000;
      const extensions = allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS;
      const normalizedExtensions = extensions.map(e => e.toLowerCase());

      console.error(`Watching directory: ${WATCH_DIR} for extensions: ${normalizedExtensions.join(", ")}`);

      return new Promise((resolve) => {
        const watcher = chokidar.watch(WATCH_DIR, {
          ignoreInitial: true,
          depth: 0,
          persistent: true,
          usePolling: true,
          interval: 1000,
        });

        const timer = setTimeout(() => {
          watcher.close();
          resolve({
            isError: true,
            content: [
              {
                type: "text",
                text: `Timeout waiting for new file in ${WATCH_DIR}`,
              },
            ],
          });
        }, timeout);

        watcher.on("add", (filePath) => {
          const ext = path.extname(filePath).toLowerCase();
          if (normalizedExtensions.includes(ext)) {
            console.error(`File found: ${filePath}`);
            clearTimeout(timer);
            watcher.close();
            
            const fullPath = path.isAbsolute(filePath) ? filePath : path.join(WATCH_DIR, filePath);
            
            resolve({
              content: [
                {
                  type: "text",
                  text: fullPath,
                },
              ],
            });
          }
        });
        
        watcher.on("error", (error) => {
          console.error(`Watcher error: ${error}`);
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
}
