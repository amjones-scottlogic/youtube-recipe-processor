import { Database } from "bun:sqlite";

const db = new Database("recipes.sqlite", { create: true });

// Initialize database schema
db.run(`
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    ingredients TEXT, -- JSON string
    instructions TEXT, -- JSON string
    prepTime TEXT,
    cookTime TEXT,
    servings TEXT,
    youtubeUrl TEXT,
    thumbnailUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
