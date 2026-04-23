// PocketBase 建表脚本 (兼容 v0.25+)
// 用法: node pb-migrate.js [pocketbase-url] [admin-email] [admin-password]
//
// 示例: node pb-migrate.js http://127.0.0.1:8090 admin@example.com yourpassword
// 重建: node pb-migrate.js http://127.0.0.1:8090 admin@example.com yourpassword --force

import PocketBase from 'pocketbase';

const PB_URL = process.argv[2] || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.argv[3];
const ADMIN_PASSWORD = process.argv[4];
const FORCE = process.argv.includes('--force');

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('用法: node pb-migrate.js <pb-url> <admin-email> <admin-password> [--force]');
  console.error('  --force  删除旧集合并重建');
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

// PocketBase v0.25+ 用 fields 而不是 schema
const TASK_FIELDS = [
  { name: 'task_id',        type: 'text',   required: true },
  { name: 'prompt',         type: 'text',   required: true },
  { name: 'size',           type: 'text',   required: true },
  { name: 'has_ref_images', type: 'bool' },
  { name: 'status',         type: 'text' },
  { name: 'image_url',      type: 'text' },   // 用 text 而非 url，避免空值校验
  { name: 'progress',       type: 'number' },
  { name: 'actual_time',    type: 'number' },
  { name: 'estimated_time', type: 'number' },
  { name: 'expires_at',     type: 'number' },
  { name: 'completed_at',   type: 'number' },
  { name: 'error_message',  type: 'text' },
];

async function migrate() {
  // 管理员登录
  await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('✓ 管理员登录成功');

  // 检查是否已存在
  let exists = false;
  try {
    await pb.collections.getOne('tasks');
    exists = true;
  } catch {
    // 不存在
  }

  if (exists && FORCE) {
    await pb.collections.delete('tasks');
    console.log('✓ 已删除旧 tasks 集合');
    exists = false;
  }

  if (exists) {
    console.log('✓ tasks 集合已存在，跳过 (用 --force 重建)');
    return;
  }

  // 创建集合
  await pb.collections.create({
    name: 'tasks',
    type: 'base',
    fields: TASK_FIELDS,
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: '',
  });

  console.log('✓ tasks 集合创建成功，包含 ' + TASK_FIELDS.length + ' 个字段');
}

migrate().catch(err => {
  console.error('迁移失败:', err.message);
  process.exit(1);
});
