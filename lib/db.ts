import mysql, { type PoolOptions, type RowDataPacket } from 'mysql2/promise';
import type { StoredTask, TaskData, TaskFilters, PaginatedResult } from './types';

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

  // 建表
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      task_id        VARCHAR(255) PRIMARY KEY,
      prompt         TEXT         NOT NULL,
      size           VARCHAR(50)  NOT NULL,
      has_ref_images TINYINT(1)   NOT NULL DEFAULT 0,
      created_at     BIGINT       NOT NULL,
      status         VARCHAR(50)  NOT NULL DEFAULT 'submitted',
      progress       INT          NOT NULL DEFAULT 0,
      image_url      TEXT         NOT NULL,
      expires_at     BIGINT       NOT NULL DEFAULT 0,
      actual_time    BIGINT       NOT NULL DEFAULT 0,
      estimated_time BIGINT       NOT NULL DEFAULT 0,
      error_message  TEXT         NOT NULL,
      completed_at   BIGINT       NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 迁移：添加新列（忽略已存在的错误）
  const migrations = [
    `ALTER TABLE tasks ADD COLUMN persistent_url TEXT NOT NULL DEFAULT ('') AFTER image_url`,
    `ALTER TABLE tasks ADD COLUMN is_favorited TINYINT(1) NOT NULL DEFAULT 0 AFTER completed_at`,
    `ALTER TABLE tasks ADD COLUMN tags TEXT NOT NULL DEFAULT ('') AFTER is_favorited`,
  ];

  for (const sql of migrations) {
    try {
      await pool.execute(sql);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code !== 'ER_DUP_FIELDNAME') throw err;
    }
  }

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
    persistent_url: row.persistent_url ?? '',
    expires_at: Number(row.expires_at),
    actual_time: Number(row.actual_time),
    estimated_time: Number(row.estimated_time),
    error_message: row.error_message,
    completed_at: Number(row.completed_at),
    is_favorited: !!row.is_favorited,
    tags: row.tags ?? '',
  };
}

// ─── 查询 ───

export async function getAllTasks(
  page = 1,
  pageSize = 20,
  filters?: TaskFilters,
): Promise<PaginatedResult<StoredTask>> {
  await ensureTable();

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters?.q) {
    conditions.push('prompt LIKE ?');
    params.push(`%${filters.q}%`);
  }
  if (filters?.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters?.favorited) {
    conditions.push('is_favorited = 1');
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM tasks ${where}`,
    params,
  );
  const total = Number(countRows[0].total);

  const offset = (page - 1) * pageSize;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM tasks ${where} ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${Number(offset)}`,
    params,
  );

  return { data: rows.map(rowToTask), total, page, pageSize };
}

export async function getTask(taskId: string): Promise<StoredTask | undefined> {
  await ensureTable();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM tasks WHERE task_id = ?',
    [taskId],
  );
  return rows.length > 0 ? rowToTask(rows[0]) : undefined;
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

// ─── 创建 ───

export async function createTask(
  task: Pick<StoredTask, 'task_id' | 'prompt' | 'size' | 'has_ref_images'>,
): Promise<void> {
  await ensureTable();
  await pool.execute(
    `INSERT INTO tasks (task_id, prompt, size, has_ref_images, created_at, image_url, error_message, persistent_url, tags)
     VALUES (?, ?, ?, ?, ?, '', '', '', '')`,
    [task.task_id, task.prompt, task.size, task.has_ref_images ? 1 : 0, Date.now()],
  );
}

// ─── 更新 ───

export async function updateTaskFromApi(taskId: string, data: TaskData): Promise<void> {
  await ensureTable();
  await pool.execute(
    `UPDATE tasks SET
       status = ?, progress = ?, image_url = ?, expires_at = ?,
       actual_time = ?, estimated_time = ?, error_message = ?, completed_at = ?
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

export async function updatePersistentUrl(taskId: string, url: string): Promise<void> {
  await ensureTable();
  await pool.execute('UPDATE tasks SET persistent_url = ? WHERE task_id = ?', [url, taskId]);
}

export async function toggleFavorite(taskId: string): Promise<boolean> {
  await ensureTable();
  await pool.execute(
    'UPDATE tasks SET is_favorited = NOT is_favorited WHERE task_id = ?',
    [taskId],
  );
  const task = await getTask(taskId);
  return task?.is_favorited ?? false;
}

export async function updateTags(taskId: string, tags: string): Promise<void> {
  await ensureTable();
  await pool.execute('UPDATE tasks SET tags = ? WHERE task_id = ?', [tags, taskId]);
}

// ─── 删除 ───

export async function deleteTask(taskId: string): Promise<void> {
  await ensureTable();
  await pool.execute('DELETE FROM tasks WHERE task_id = ?', [taskId]);
}

export async function deleteAllTasks(): Promise<void> {
  await ensureTable();
  await pool.execute('TRUNCATE TABLE tasks');
}

export async function deleteTasks(taskIds: string[]): Promise<void> {
  if (taskIds.length === 0) return;
  await ensureTable();
  const placeholders = taskIds.map(() => '?').join(',');
  await pool.execute(`DELETE FROM tasks WHERE task_id IN (${placeholders})`, taskIds);
}

// ─── 批量收藏 ───

export async function batchFavorite(taskIds: string[], favorite: boolean): Promise<void> {
  if (taskIds.length === 0) return;
  await ensureTable();
  const placeholders = taskIds.map(() => '?').join(',');
  await pool.execute(
    `UPDATE tasks SET is_favorited = ? WHERE task_id IN (${placeholders})`,
    [favorite ? 1 : 0, ...taskIds],
  );
}
