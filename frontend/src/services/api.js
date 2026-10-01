const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Could not reach Xtrack. Check that the API is running.');
  }

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error ?? 'The request could not be completed.');
  }

  if (response.status === 204) return null;
  return response.json();
}