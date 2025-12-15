# File Watcher MCP Server

This is a Model Context Protocol (MCP) server that provides a tool to wait for a file to appear in a specific directory.

## Tools

### `waitForNewFile`

Waits for a new file to appear in the user's Downloads directory.

**Arguments:**
- `timeoutMs` (number, optional): Timeout in milliseconds (default: 60000).
- `allowedExtensions` (string[], optional): List of allowed file extensions (e.g. `['.mp4', '.txt']`). Defaults to video extensions (`.mp4`, `.mov`, `.avi`, `.wmv`, `.mpg`, `.mpeg`, `.webm`).

### `processFile`

Processes a video file with Gemini 3 using a given prompt.

**Arguments:**
- `filePath` (string): The absolute path to the video file.
- `prompt` (string): The prompt to send to Gemini.

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
