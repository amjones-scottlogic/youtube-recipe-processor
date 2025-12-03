# File Watcher MCP Server

This is a Model Context Protocol (MCP) server that provides a tool to wait for a file to appear in a specific directory.

## Tools

### `waitForFileType`

Polls a directory waiting for a file with a specific extension to appear, then processes it with Gemini 3.

**Arguments:**
- `directory` (string): The directory to watch.
- `extension` (string): The file extension to wait for (e.g. .mp4).
- `prompt` (string): The prompt to send to Gemini with the video.
- `timeoutMs` (number, optional): Timeout in milliseconds (default: 60000).

**Environment Variables:**
- `GEMINI_API_KEY`: Required for Gemini API access.


## Usage

To run the server:

```bash
bun start
```

This will start the server on Stdio. You can configure this in your MCP client (e.g. Claude Desktop, or another MCP host).

## Configuration

Ensure you have [Bun](https://bun.sh/) installed.

1. Install dependencies:
   ```bash
   bun install
   ```

2. Run the server:
   ```bash
   bun start
   ```
