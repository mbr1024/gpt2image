import type {
  ImageGenerationRequest,
  SubmitResponse,
  TaskQueryResponse,
  ApiError,
} from './types';

const BASE_URL = 'https://api.apimart.ai';

function getApiKey(): string {
  const key = process.env.APIMART_API_KEY;
  if (!key) throw new Error('APIMART_API_KEY 环境变量未配置');
  return key;
}

function headers(): HeadersInit {
  return {
    'Authorization': `Bearer ${getApiKey()}`,
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

export async function submitTask(request: ImageGenerationRequest): Promise<SubmitResponse> {
  const res = await fetch(`${BASE_URL}/v1/images/generations`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: 'gpt-image-2',
      n: 1,
      ...request,
    }),
  });
  return handleResponse<SubmitResponse>(res);
}

export async function queryTask(taskId: string): Promise<TaskQueryResponse> {
  const res = await fetch(`${BASE_URL}/v1/tasks/${taskId}`, {
    headers: headers(),
  });
  return handleResponse<TaskQueryResponse>(res);
}
