// src/utils/auth.ts
export const isTokenExpired = (token: string) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
};

export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // se o refresh token estiver em cookie
    });
    const data = await response.json();
    localStorage.setItem('token', data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
};
