import { ApiErrorResponse, ApiErrorDetail } from './types';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];

  constructor(statusCode: number, code: string, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;

  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  if (response.status === 204) {
    return null as unknown as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = (data as ApiErrorResponse)?.error;
    const code = errorData?.code || 'INTERNAL_ERROR';
    const message = errorData?.message || `Request failed with status ${response.status}`;
    const details = errorData?.details;

    throw new ApiError(response.status, code, message, details);
  }

  return data as T;
}

export const api = {
  get<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
};
