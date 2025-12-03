import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerProcessFile } from "./tools/processFile.js";
import { registerWaitForNewFile } from "./tools/waitForNewFile.js";

const server = new McpServer({
  name: "youtube-recipe-mcp",
  version: "1.0.0",
});

registerProcessFile(server);
registerWaitForNewFile(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("YouTube Recipe MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
