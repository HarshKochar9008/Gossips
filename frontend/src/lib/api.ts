const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type FetchOptions = RequestInit & {
  token?: string;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
      });
    } catch (err) {
      const isNetworkError =
        err instanceof TypeError &&
        (err.message === 'Failed to fetch' || err.message.includes('fetch'));
      if (isNetworkError) {
        throw new ApiError(
          0,
          `Cannot reach the API at ${this.baseUrl}. Start the backend (e.g. run "npm start" in the backend folder).`,
        );
      }
      throw err;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      const rawMessage = error?.message ?? error?.error;
      const message =
        (typeof rawMessage === 'string' ? rawMessage : null) ||
        (rawMessage && typeof rawMessage === 'object' && typeof (rawMessage as { message?: string }).message === 'string'
          ? (rawMessage as { message: string }).message
          : null) ||
        (rawMessage && typeof rawMessage === 'object' ? JSON.stringify(rawMessage) : null) ||
        'Request failed';
      throw new ApiError(response.status, message);
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = new ApiClient(API_URL);
