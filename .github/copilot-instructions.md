# Copilot Instructions

The following is the project README, which describes the architecture, tech stack, and goals of the project. Use this context when generating code or answering questions.

---

# YouTube Recipe Processor

A full-stack web application that allows users to convert YouTube cooking videos into structured recipes using Gemini 3 AI.

## Overview

This project simplifies the process of extracting recipes from YouTube videos. Users can simply paste a YouTube link, and the application uses Google's Gemini 3 model to analyze the video content (transcript/description) and generate a structured recipe (ingredients, instructions, prep time, etc.), which is then saved to a local database.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Language:** TypeScript
- **Frontend:** React (Vite)
- **Backend:** Bun (with Hono)
- **Database:** SQLite (via Bun's native SQLite or Drizzle ORM)
- **AI:** Google Gemini 3
- **Styling:** Tailwind CSS

## Features

- 🎥 **YouTube Integration:** Parse YouTube video links.
- 🤖 **AI Processing:** Utilize Gemini 3 to extract recipe details.
- 💾 **Recipe Management:** Save, view, and manage extracted recipes.
- ⚡ **Fast Performance:** Built on Bun for high-speed execution.

## Project Structure

The project is organized as a monorepo:

- `client/`: React frontend application.
- `server/`: Bun backend API and database logic.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed.
- A Google Gemini API Key.

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   bun install
   ```

### Configuration

Create a `.env` file in the `server` directory with the following:

```env
GEMINI_API_KEY=your_api_key_here
DATABASE_URL=file:./dev.db
```

### Running the App

*Instructions to be added as project setup is completed.*
