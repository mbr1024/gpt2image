export interface ImageGenerationRequest {
  model: 'gpt-image-2';
  prompt: string;
  n: 1;
  size: string;
  image_urls?: string[];
  official_fallback?: boolean;
}

export interface SubmitResponse {
  code: number;
  data: Array<{
    status: 'submitted';
    task_id: string;
  }>;
}

export interface TaskResult {
  images: Array<{
    url: string[];
    expires_at: number;
  }>;
}

export interface TaskData {
  id: string;
  status: 'submitted' | 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  created: number;
  completed?: number;
  actual_time?: number;
  estimated_time?: number;
  result?: TaskResult;
  error?: { message: string };
}

export interface TaskQueryResponse {
  code: number;
  data: TaskData;
}

export interface BatchQueryResponse {
  code: number;
  data: TaskData[];
}

export interface ApiError {
  error: {
    code: number;
    message: string;
    type: string;
  };
}

export interface StoredTask {
  task_id: string;
  prompt: string;
  size: string;
  has_ref_images: boolean;
  created_at: number;
  api_data?: TaskData;
}
