import http from 'k6/http';
import { check, sleep } from 'k6';
import { handleSummary as generateReport } from '../utils/report.js';

// Carrega a configuração geral e de login
const config = JSON.parse(open('../config/config.json'));
const loginData = JSON.parse(open('../config/login.json'));

// Determina o ambiente com base na variável de ambiente passada no comando
const environment = __ENV.environment || 'homolog';  // Default para homolog
let currentTest;
let currentLoginData;

// Seleciona o teste e os dados de login de acordo com o ambiente
if (config.tests[environment] && loginData[environment]) {
  currentTest = config.tests[environment];
  currentLoginData = loginData[environment];
} else {
  console.error(`Ambiente '${environment}' desconhecido. Use 'homolog' ou 'prod'.`);
  throw new Error('Configuração de ambiente inválida');
}

// Define o tipo de teste (smoke ou load)
const testType = 'smoke';  // ou 'load', dependendo do cenário que deseja testar
const testConfig = config[testType];

// Configura as opções do teste com base no arquivo de configuração
export let options = {
  stages: testConfig.stages,  // Estágios de carga ou fumaça
  thresholds: testConfig.thresholds  // Limites de performance
};

// Função de autenticação
function authenticate(loginData) {
  let res = http.post(loginData.url, JSON.stringify(loginData.body), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'login status was 200': (r) => r.status === 200,
  });

  if (res.status === 200) {
    let token = res.json().token;  // Aqui depende do formato da resposta de login
    return token;
  } else {
    console.error('Falha ao autenticar');
    return null;
  }
}

// Setup para realizar o login antes de rodar os testes
export function setup() {
  let token = null;

  // Executa o login uma única vez antes de todas as requisições, se necessário
  if (currentTest.requiresToken) {
    token = authenticate(currentLoginData);  // Autenticação conforme o ambiente
    console.log(`Token gerado para o ambiente '${environment}': ${token}`);
  }

  // Retorna o token para uso nas requisições
  return { token };
}

export default function (data) {
  const token = data.token;  // Token retornado do setup
  let res;

  // Se o teste requer token, adiciona no cabeçalho
  if (currentTest.requiresToken && token) {
    currentTest.headers['Authorization'] = `Bearer ${token}`;
  }

  // Faz a requisição GET ou POST com o cabeçalho e o corpo corretos
  if (currentTest.method === "GET") {
    res = http.get(currentTest.url, { headers: currentTest.headers });
  } else if (currentTest.method === "POST") {
    res = http.post(currentTest.url, JSON.stringify(currentTest.body), { headers: currentTest.headers });
  }

  // Exibe o status da resposta e parte do corpo
  console.log(`Response for ${currentTest.name}: ${res.status}`);
  console.log(res.body);

  // Validações da resposta
  check(res, {
    'status was 200': (r) => r.status === 200,
    'response time was < 500ms': (r) => r.timings.duration < 500,
  });

  // Pausa entre as requisições (definido no config.json, com fallback para 1 segundo)
  sleep(config.sleepDuration || 1);
}

// Função para gerar o relatório de execução
export function handleSummary(data) {
  return generateReport(data);
}
