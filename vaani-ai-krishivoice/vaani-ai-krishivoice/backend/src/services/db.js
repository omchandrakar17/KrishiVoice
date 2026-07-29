import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || './data/vaani.db';
const resolvedPath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);

fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

const db = new Database(resolvedPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,               -- 'user' | 'assistant'
    source_lang TEXT,
    target_lang TEXT,
    original_text TEXT,
    translated_text TEXT,
    intent TEXT,
    function_called TEXT,
    function_result TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
  CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
`);

export function insertConversationTurn(turn) {
  const stmt = db.prepare(`
    INSERT INTO conversations
      (session_id, role, source_lang, target_lang, original_text, translated_text, intent, function_called, function_result)
    VALUES (@session_id, @role, @source_lang, @target_lang, @original_text, @translated_text, @intent, @function_called, @function_result)
  `);
  const info = stmt.run({
    session_id: turn.session_id,
    role: turn.role,
    source_lang: turn.source_lang || null,
    target_lang: turn.target_lang || null,
    original_text: turn.original_text || null,
    translated_text: turn.translated_text || null,
    intent: turn.intent || null,
    function_called: turn.function_called || null,
    function_result: turn.function_result ? JSON.stringify(turn.function_result) : null,
  });
  return info.lastInsertRowid;
}

export function getHistory({ session_id, limit = 50, offset = 0 }) {
  if (session_id) {
    return db.prepare(`
      SELECT * FROM conversations WHERE session_id = ?
      ORDER BY id DESC LIMIT ? OFFSET ?
    `).all(session_id, limit, offset);
  }
  return db.prepare(`
    SELECT * FROM conversations ORDER BY id DESC LIMIT ? OFFSET ?
  `).all(limit, offset);
}

export function logEvent(event_type, metadata = {}) {
  db.prepare(`INSERT INTO analytics_events (event_type, metadata) VALUES (?, ?)`)
    .run(event_type, JSON.stringify(metadata));
}

export function getAnalyticsSummary() {
  const totalConversations = db.prepare(`SELECT COUNT(*) AS c FROM conversations`).get().c;
  const byLang = db.prepare(`
    SELECT source_lang, target_lang, COUNT(*) as count
    FROM conversations
    WHERE source_lang IS NOT NULL
    GROUP BY source_lang, target_lang
    ORDER BY count DESC
  `).all();
  const byIntent = db.prepare(`
    SELECT intent, COUNT(*) as count FROM conversations
    WHERE intent IS NOT NULL GROUP BY intent ORDER BY count DESC
  `).all();
  const last7days = db.prepare(`
    SELECT date(created_at) as day, COUNT(*) as count
    FROM conversations
    WHERE created_at >= datetime('now', '-7 days')
    GROUP BY day ORDER BY day ASC
  `).all();
  return { totalConversations, byLang, byIntent, last7days };
}

export default db;
