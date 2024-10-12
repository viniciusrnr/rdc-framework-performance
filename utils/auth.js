import http from 'k6/http';
import { check } from 'k6';

export function authenticate(loginData) {
  let token = null;
  const loginResponse = http.post(loginData.url, JSON.stringify(loginData.body), {
    headers: { 'Content-Type': 'application/json' }
  });

  if (check(loginResponse, { 'login status was 200': (r) => r.status === 200 })) {
    token = loginResponse.json().token;
    console.log(`Obtido token: ${token}`);
  } else {
    console.error('Falha ao obter token.');
    throw new Error('Erro de autenticação');
  }

  return token;
}
