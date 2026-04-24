import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function DELETE() {
  db.deleteAllTasks();
  return NextResponse.json({ ok: true });
}
