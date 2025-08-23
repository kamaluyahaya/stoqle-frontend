// utils/auth.ts
export function getAuth() {
  const userRaw = localStorage.getItem('user');
  const tokenRaw = localStorage.getItem('token');

  const user = userRaw ? JSON.parse(userRaw) : null;
  const token = tokenRaw ? JSON.parse(tokenRaw) : null;

  return { user, token };
}
