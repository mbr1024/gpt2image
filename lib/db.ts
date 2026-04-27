import mysql, { type PoolOptions, type RowDataPacket } from 'mysql2/promise';
import type { StoredTask, TaskData } from './types';

const poolConfig: PoolOptions = {
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: Number(process.env.MYSQL_PORT ?? 3306),
  database: process.env.MYSQL_DATABASE ?? 'gpt2image',
  user: process.env.MYSQL_USER ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
};

const pool = mysql.createPool(poolConfig);

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      task_id       VARCHAR(255) PRIMARY KEY,
      prompt        TEXT         NOT NULL,
      size          VARCHAR(50)  NOT NULL,
      has_ref_images TINYINT(1)  NOT NULL DEFAULT 0,
      created_at    BIGINT       NOT NULL,
      status        VARCHAR(50)  NOT NULL DEFAULT 'submitted',
      progress      INT          NOT NULL DEFAULT 0,
      image_url     TEXT         NOT NULL,
      expires_at    BIGINT       NOT NULL DEFAULT 0,
      actual_time   BIGINT       NOT NULL DEFAULT 0,
      estimated_time BIGINT      NOT NULL DEFAULT 0,
      error_message TEXT         NOT NULL,
      completed_at  BIGINT       NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  tableReady = true;
}

function rowToTask(row: RowDataPacket): StoredTask {
  return {
    task_id: row.task_id,
    prompt: row.prompt,
    size: row.size,
    has_ref_images: !!row.has_ref_images,
    created_at: Number(row.created_at),
    status: row.status,
    progress: row.progress,
    image_url: row.image_url,
    expires_at: Number(row.expires_at),
    actual_time: Number(row.actual_time),
    estimated_time: Number(row.estimated_time),
    error_message: row.error_message,
    completed_at: Number(row.completed_at),
  };
}

export async function getAllTasks(): Promise<StoredTask[]> {
  await ensureTable();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM tasks ORDER BY created_at DESC',
  );
  return rows.map(rowToTask);
}

export async function getTask(taskId: string): Promise<StoredTask | undefined> {
  await ensureTable();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM tasks WHERE task_id = ?',
    [taskId],
  );
  return rows.length > 0 ? rowToTask(rows[0]) : undefined;
}

export async function createTask(
  task: Pick<StoredTask, 'task_id' | 'prompt' | 'size' | 'has_ref_images'>,
): Promise<void> {
  await ensureTable();
  await pool.execute(
    `INSERT INTO tasks (task_id, prompt, size, has_ref_images, created_at, image_url, error_message)
     VALUES (?, ?, ?, ?, ?, '', '')`,
    [task.task_id, task.prompt, task.size, task.has_ref_images ? 1 : 0, Date.now()],
  );
}

export async function updateTaskFromApi(taskId: string, data: TaskData): Promise<void> {
  await ensureTable();
  await pool.execute(
    `UPDATE tasks SET
       status = ?,
       progress = ?,
       image_url = ?,
       expires_at = ?,
       actual_time = ?,
       estimated_time = ?,
       error_message = ?,
       completed_at = ?
     WHERE task_id = ?`,
    [
      data.status,
      data.progress ?? 0,
      data.result?.images?.[0]?.url?.[0] ?? '',
      data.result?.images?.[0]?.expires_at ?? 0,
      data.actual_time ?? 0,
      data.estimated_time ?? 0,
      data.error?.message ?? '',
      data.completed ?? 0,
      taskId,
    ],
  );
}

export async function deleteTask(taskId: string): Promise<void> {
  await ensureTable();
  await pool.execute('DELETE FROM tasks WHERE task_id = ?', [taskId]);
}

export async function deleteAllTasks(): Promise<void> {
  await ensureTable();
  await pool.execute('TRUNCATE TABLE tasks');
}

export async function getActiveTasks(): Promise<StoredTask[]> {
  await ensureTable();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM tasks
     WHERE status IN ('submitted', 'pending', 'processing')
     ORDER BY created_at DESC`,
  );
  return rows.map(rowToTask);
}
