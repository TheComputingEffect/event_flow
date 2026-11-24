export const NETWORK_ERROR_MESSAGE = "Couldn't reach server. Try again.";
export const NOT_SIGNED_IN_MESSAGE = "You're not signed in.";
export const UNAUTHORIZED_STATUS = 401;

/** The one error type every API call throws. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === UNAUTHORIZED_STATUS;
}
