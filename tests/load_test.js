import http from 'k6/http';
import { check, sleep } from 'k6';
import { authenticate } from '../utils/auth.js';
import { handleSummary as generateReport } from '../utils/report.js';

// Carrega a configuração
const config = JSON.parse(open('../config/config.json'));
const loginData = JSON.parse(open('../config/login.json'));

// Determina o ambiente e obtém as informações de login apropriadas
let currentLoginData;
if (config.environment === "homolog") {
  currentLoginData = loginData.homolog;
} else if (config.environment === "prod") {
  currentLoginData = loginData.production;
} else {
  console.error('Ambiente desconhecido. Use "homolog" ou "prod".');
  throw new Error('Configuração de ambiente inválida');
}

// Escolha entre configurações de "load" ou "smoke" com base no tipo de teste
const testType = 'load';  // Altere para 'smoke' quando necessário
const testConfig = config[testType];

// Configura as opções do teste com base no arquivo de configuração
export let options = {
  stages: testConfig.stages,  // Usando as fases (ramp-up, stable, ramp-down)
  thresholds: testConfig.thresholds  // Limites de performance
};

export default function () {
  let token = null;

  for (let test of config.tests) {
    let res;

    if (test.requiresToken) {
      token = authenticate(currentLoginData);  // Obtém o token usando a função de autenticação
    }

    if (token) {
      test.headers['Authorization'] = `Bearer ${token}`;
    }

    if (test.method === "GET") {
      res = http.get(test.url, { headers: test.headers });
    } else if (test.method === "POST") {
      res = http.post(test.url, JSON.stringify(test.body), { headers: test.headers });
    }

    // Exibe o status da resposta e parte do corpo
    console.log(`Response for ${test.name}: ${res.status}`);
    console.log(res.body);

    check(res, {
      'status was 200': (r) => r.status === 200,
      'response time was < 500ms': (r) => r.timings.duration < 500,
    });

    // Pausa entre as requisições (definido no config.json, com fallback para 1 segundo)
    sleep(config.sleepDuration || 1);
  }
}

export function handleSummary(data) {
  return generateReport(data);
}
