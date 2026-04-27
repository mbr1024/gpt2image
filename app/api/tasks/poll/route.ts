import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import * as apimart from '@/lib/apimart';

export async function POST() {
  const activeTasks = await db.getActiveTasks();

  if (activeTasks.length === 0) {
    return NextResponse.json({ updated: 0 });
  }

  let updated = 0;

  for (const task of activeTasks) {
    try {
      const res = await apimart.queryTask(task.task_id);
      if (res.data) {
        await db.updateTaskFromApi(task.task_id, res.data);
        updated++;
      }
    } catch {
      // skip failed queries
    }
  }

  const tasks = await db.getAllTasks();
  return NextResponse.json({ updated, tasks });
}
