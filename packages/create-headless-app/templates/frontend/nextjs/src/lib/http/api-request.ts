import { ApiException } from './api-exception';

export type ApiRequestOptions = RequestInit & {
  timeoutMs?: number;
};

function withTimeoutSignal(timeoutMs: number, signal?: AbortSignal): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const abortFromParent = () => {
    controller.abort();
  };

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', abortFromParent, { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      if (signal) {
        signal.removeEventListener('abort', abortFromParent);
      }
    },
  };
}

export async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return { message: text };
    }
  }

  return text;
}

export async function apiRequest(
  input: RequestInfo | URL,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const { timeoutMs = 30000, signal, ...fetchOptions } = options;
  const parentSignal = signal ?? undefined;
  const { signal: requestSignal, cleanup } = withTimeoutSignal(timeoutMs, parentSignal);

  try {
    return await fetch(input, {
      ...fetchOptions,
      signal: requestSignal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiException('Request timeout', {
        statusCode: 408,
        code: 'TIMEOUT',
        cause: error,
      });
    }

    throw new ApiException(
      error instanceof Error ? error.message : 'Network error',
      {
        statusCode: 503,
        code: 'NETWORK_ERROR',
        cause: error,
      }
    );
  } finally {
    cleanup();
  }
}

export async function apiRequestJson<T>(
  input: RequestInfo | URL,
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await apiRequest(input, options);
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw ApiException.fromResponse(response, body);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return {} as T;
  }

  if (!body || typeof body === 'string') {
    return {} as T;
  }

  return body as T;
}
