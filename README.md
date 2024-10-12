# RDC Framework Performance

Este é um framework de automação de performance usando o k6 para realizar testes de carga e smoke. A configuração dos testes pode ser feita diretamente via arquivos JSON, permitindo flexibilidade para diferentes ambientes e tipos de teste (carga e smoke).

## Requisitos

- [Node.js](https://nodejs.org/) instalado.
- [k6](https://k6.io/) instalado.

## Instalação

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd rdc-framework-performance
   
2. Instale o k6 (caso ainda não tenha instalado):

No Windows:
Instruções de instalação do k6 para Windows

3. Estrutura de Arquivos:

config.json: Contém as configurações de ambiente, estágios de teste (ramp-up, stable, ramp-down), e thresholds de performance.
login.json: Contém as informações de autenticação para diferentes ambientes (homolog, produção).
tests/load_test.js: Teste de carga.
tests/smoke_test.js: Teste de smoke.
utils/auth.js: Função para autenticação.
utils/report.js: Função para gerar relatórios.


4. Como Configurar
Configurações de Ambiente
No arquivo config.json, você pode definir o ambiente e os estágios dos testes. Exemplo:
```bash
{
  "homolog": {
    "url": "https://homologapinovosite.rdc-ferias.com.br/api/TwoFactorAutentication/login2fa",
    "body": {
      "grantType": "Password",
      "usuario": "ti.teste@rdcviagens.com.br",
      "senha": "1234",
      "dadosNavegador": ""
    }
  },
  "prod": {
    "url": "https://api.rdc-ferias.com.br/api/TwoFactorAutentication/login2fa",
    "body": {
      "grantType": "Password",
      "usuario": "prod.user@rdcviagens.com.br",
      "senha": "prodSenha123",
      "dadosNavegador": ""
    }
  }
}
```


5. Como Executar
Teste de Carga (Load Test)
1. Certifique-se de que o ambiente e as configurações estão corretos em config.json.

2. Para rodar o teste de carga, execute o seguinte comando no terminal:
```
k6 run tests/load_test.js
```

3. Teste de Smoke (Smoke Test)
Certifique-se de que o ambiente e as configurações estão corretos em config.json.

Para rodar o teste de smoke, execute o comando:
```
k6 run tests/smoke_test.js
```

6. Relatório
Ao final de cada execução, um relatório em HTML será gerado automaticamente. 
Você pode visualizar o relatório abrindo o arquivo summary.html no seu navegador.


Ajustes Finais
Você pode customizar os valores de vus, duration, e thresholds diretamente no arquivo config.json para ajustar o comportamento dos testes de carga e smoke conforme necessário.