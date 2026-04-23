import type { ImageGenerationRequest, SubmitResponse, TaskQueryResponse, BatchQueryResponse, ApiError } from '../types/api';

const BASE_URL = 'https://api.apimart.ai';

function headers(apiKey: string): HeadersInit {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      if (json?.error?.message) msg = json.error.message;
    } catch { /* non-JSON error body */ }
    throw new Error(msg);
  }
  const json = await res.json();
  if ((json as ApiError).error) {
    throw new Error((json as ApiError).error.message);
  }
  return json as T;
}

export async function submitTask(
  apiKey: string,
  request: ImageGenerationRequest,
): Promise<SubmitResponse> {
  const res = await fetch(`${BASE_URL}/v1/images/generations`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(request),
  });
  return handleResponse<SubmitResponse>(res);
}

export async function queryTask(
  apiKey: string,
  taskId: string,
): Promise<TaskQueryResponse> {
  const res = await fetch(`${BASE_URL}/v1/tasks/${taskId}`, {
    headers: headers(apiKey),
  });
  return handleResponse<TaskQueryResponse>(res);
}

export async function batchQueryTasks(
  apiKey: string,
  taskIds: string[],
): Promise<BatchQueryResponse> {
  const res = await fetch(`${BASE_URL}/v1/tasks/batch`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({ task_ids: taskIds }),
  });
  return handleResponse<BatchQueryResponse>(res);
}
