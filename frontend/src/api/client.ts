import { tokenStore } from './auth/tokenStore';
import {
  ApiError,
  NETWORK_ERROR_MESSAGE,
  NOT_SIGNED_IN_MESSAGE,
  UNAUTHORIZED_STATUS,
} from './errors';
import type { components } from './schema';

const DEFAULT_API_URL = 'http://localhost:8080/api/v1';
const REQUEST_TIMEOUT_MS = 15_000;

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;

type ApiErrorBody = components['schemas']['ApiError'];
type Envelope<T> = { success: true; data: T } | { success: false; error?: ApiErrorBody };

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_ERROR_MESSAGE);
  } finally {
    clearTimeout(timer);
  }
}

async function readEnvelope<T>(response: Response): Promise<Envelope<T> | null> {
  try {
    return (await response.json()) as Envelope<T>;
  } catch {
    return null;
  }
}

function toApiError(status: number, body: ApiErrorBody | undefined): ApiError {
  if (status === UNAUTHORIZED_STATUS) {
    return new ApiError(status, body?.code ?? 'UNAUTHORIZED', NOT_SIGNED_IN_MESSAGE);
  }
  return new ApiError(
    status,
    body?.code ?? 'UNKNOWN_ERROR',
    body?.message ?? NETWORK_ERROR_MESSAGE,
  );
}

/** GET a contract path (e.g. "/dashboard/home") and return the unwrapped `data`. */
export async function apiGet<T>(path: string): Promise<T> {
  const token = tokenStore.get();
  if (!token) throw new ApiError(UNAUTHORIZED_STATUS, 'NO_TOKEN', NOT_SIGNED_IN_MESSAGE);

  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const envelope = await readEnvelope<T>(response);
  if (response.ok && envelope?.success) return envelope.data;
  throw toApiError(response.status, envelope && !envelope.success ? envelope.error : undefined);
}
