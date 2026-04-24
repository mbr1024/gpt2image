import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { StoredTask, TaskData } from './types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'tasks.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  fs.mkdirSync(DB_DIR, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');

  _db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      task_id TEXT PRIMARY KEY,
      prompt TEXT NOT NULL,
      size TEXT NOT NULL,
      has_ref_images INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted',
      progress REAL NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL DEFAULT '',
      expires_at INTEGER NOT NULL DEFAULT 0,
      actual_time REAL NOT NULL DEFAULT 0,
      estimated_time REAL NOT NULL DEFAULT 0,
      error_message TEXT NOT NULL DEFAULT '',
      completed_at INTEGER NOT NULL DEFAULT 0
    )
  `);

  return _db;
}

export function getAllTasks(): StoredTask[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all() as StoredTask[];
  return rows.map(r => ({ ...r, has_ref_images: Boolean(r.has_ref_images) }));
}

export function getTask(taskId: string): StoredTask | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tasks WHERE task_id = ?').get(taskId) as StoredTask | undefined;
  if (row) row.has_ref_images = Boolean(row.has_ref_images);
  return row;
}

export function createTask(task: Pick<StoredTask, 'task_id' | 'prompt' | 'size' | 'has_ref_images'>): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO tasks (task_id, prompt, size, has_ref_images, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(task.task_id, task.prompt, task.size, task.has_ref_images ? 1 : 0, Date.now());
}

export function updateTaskFromApi(taskId: string, data: TaskData): void {
  const db = getDb();
  const imageUrl = data.result?.images?.[0]?.url?.[0] ?? '';
  const expiresAt = data.result?.images?.[0]?.expires_at ?? 0;

  db.prepare(`
    UPDATE tasks SET
      status = ?,
      progress = ?,
      image_url = ?,
      expires_at = ?,
      actual_time = ?,
      estimated_time = ?,
      error_message = ?,
      completed_at = ?
    WHERE task_id = ?
  `).run(
    data.status,
    data.progress ?? 0,
    imageUrl,
    expiresAt,
    data.actual_time ?? 0,
    data.estimated_time ?? 0,
    data.error?.message ?? '',
    data.completed ?? 0,
    taskId,
  );
}

export function deleteTask(taskId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM tasks WHERE task_id = ?').run(taskId);
}

export function deleteAllTasks(): void {
  const db = getDb();
  db.prepare('DELETE FROM tasks').run();
}

export function getActiveTasks(): StoredTask[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM tasks WHERE status IN ('submitted', 'pending', 'processing') ORDER BY created_at DESC"
  ).all() as StoredTask[];
  return rows.map(r => ({ ...r, has_ref_images: Boolean(r.has_ref_images) }));
}
