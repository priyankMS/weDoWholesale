import axios from "axios";

// Every /api route responds with { error: string } on failure — this pulls
// that message out of an axios error (or falls back) so callers don't have
// to duplicate the same isAxiosError/response.data dance in every catch.
export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? fallback;
  }
  return fallback;
}
