# RDC Framework Performance

Este é um framework de automação de performance usando o k6 para realizar testes de carga e smoke. A configuração dos testes pode ser feita diretamente via arquivos JSON, permitindo flexibilidade para diferentes ambientes e tipos de teste (carga e smoke).

## Requisitos

- [Node.js](https://nodejs.org/) instalado.
- [k6](https://dl.k6.io/msi/k6-latest-amd64.msi) instalado.

## Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/viniciusrnr/rdc-framework-performance.git
   cd rdc-framework-performance

3. **Estrutura de Arquivos:**

- config.json: Contém as configurações de ambiente, estágios de teste (ramp-up, stable, ramp-down), e thresholds de performance.
- login.json: Contém as informações de autenticação para diferentes ambientes (homolog, produção).
- tests/load_test.js: Teste de carga.
- tests/smoke_test.js: Teste de smoke.
- utils/auth.js: Função para autenticação.
- utils/report.js: Função para gerar relatórios.


## Como Configurar

O arquivo config.json permite definir as configurações para os testes, como os ambientes, estágios de carga, e outras propriedades. Abaixo está uma explicação detalhada de cada bloco:

```bash
{
  "tests": {
    "homolog": {
      "name": "Teste GET destinos pesquisados (Homolog)",
      "requiresToken": true,
      "url": "https://hmgreservas.rdcviagens.com.br/api/Associado/destinosPesquisados",
      "method": "GET",
      "headers": {
        "Content-Type": "application/json"
      },
      "environment": "homolog"
    },
    "prod": {
      "name": "Teste GET destinos pesquisados (Prod)",
      "requiresToken": true,
      "url": "https://reservas.rdcviagens.com.br/api/Associado/destinosPesquisados",
      "method": "GET",
      "headers": {
        "Content-Type": "application/json"
      },
      "environment": "prod"
    }
  },
  "load": {
    "stages": [
      { "duration": "13s", "target": 2000 },
      { "duration": "3m", "target": 2000 },
      { "duration": "3s", "target": 0 }
    ],
    "thresholds": {
      "http_req_duration": ["p(95)<900"]
    }
  },
  "smoke": {
    "stages": [
      { "duration": "1s", "target": 1 }
    ],
    "thresholds": {
      "http_req_duration": ["p(95)<500"]
    }
  },
  "sleepDuration": 1
}

```
**Explicação dos Blocos:**
1. **Bloco tests**
Este bloco contém as configurações específicas para cada ambiente (por exemplo, homologação e produção). Aqui você pode definir os endpoints, tokens, e métodos HTTP que os testes irão usar.

- homolog e prod: Definem as configurações para os ambientes de homologação e produção, respectivamente.
- name: O nome do teste para aquele ambiente.
- requiresToken: Define se o teste precisa de um token de autenticação. Se true, um token será necessário.
- url: A URL do endpoint da API que será testado.
- method: O método HTTP usado (neste caso, GET).
- headers: Os cabeçalhos que serão enviados com a requisição (por exemplo, o tipo de conteúdo application/json).
- environment: Identifica o ambiente de execução (homolog ou prod), útil para distinguir a configuração durante a execução dos testes.

2. **Bloco load*
Define as configurações para um teste de carga, que é utilizado para simular múltiplas requisições em um ambiente por um período prolongado.

- stages: Estágios do teste de carga, que controlam a duração e a quantidade de usuários virtuais (VU - Virtual Users) ao longo do tempo.
- duration: Quanto tempo cada estágio do teste irá durar.
- target: O número de usuários virtuais (conexões simultâneas) que estarão ativos durante aquele estágio.
- No exemplo:
- O primeiro estágio tem 2000 usuários durante 13 segundos.
- O segundo mantém 2000 usuários por 3 minutos.
- O último reduz os usuários para 0 em 3 segundos, finalizando o teste.
- thresholds: Limites definidos para medir a performance.
- http_req_duration: Define que 95% das requisições HTTP devem ser finalizadas em menos de 900ms.
3. **Bloco smoke**
Este bloco define as configurações para um teste de fumaça (smoke test), que é uma verificação rápida para garantir que a API está respondendo corretamente antes de rodar testes mais intensos, como os de carga.

- stages: Configurações para o smoke test.
- duration: A duração do teste (1 segundo neste exemplo).
- target: O número de usuários (apenas 1 usuário virtual neste exemplo).
- thresholds: Limites de performance para o teste de fumaça.
- http_req_duration: Aqui, o limite é mais rigoroso, com 95% das requisições sendo finalizadas em menos de 500ms, já que o objetivo é uma resposta rápida.

4. **Bloco sleepDuration**

Define o tempo de pausa entre as requisições para dar um pequeno intervalo antes de executar a próxima interação, simulando um uso mais realista do sistema.

sleepDuration: O tempo de espera (em segundos) entre uma requisição e outra, neste caso, 1 segundo.

## Execução

**Teste de Smoke (Smoke Test)**

Tem a finalidade de testar o teste antes de rodar o arquivo load_test.js (recomendamos não alterar a quantidade de execução e tempo, por se tratar de uma validação da api)

Para rodar o teste de smoke, execute o comando:
```
k6 run tests/smoke_test.js
```

**Teste de Carga (Load Test)**
Para rodar o teste de carga, execute o seguinte comando no terminal:
```
k6 run tests/load_test.js
```

## Relatório
Ao final de cada execução, um relatório em HTML será gerado automaticamente. 
Você pode visualizar o relatório abrindo o arquivo summary.html no seu navegador.


**Observação**
Você pode customizar os valores de vus, duration, e thresholds diretamente no arquivo config.json para ajustar o comportamento dos testes de carga e smoke conforme necessário.
