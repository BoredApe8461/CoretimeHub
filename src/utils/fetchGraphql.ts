import { ApiResponse } from '@/models';

export async function fetchGraphql(
  url: string,
  query: string
): Promise<ApiResponse> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
      }),
    });
    const { data } = await res.json();
    return {
      status: res.status,
      data,
    };
  } catch {
    return {
      status: 400,
      data: {},
    };
  }
}
