# Backlog de Tarefas — Weather App

Backlog derivado de `plans/weather-app-plan.md` e rastreado aos requisitos de
`specs/weather-app-spec.md`. As decisões bloqueadoras da spec devem ser
aprovadas antes de congelar os contratos de dados e os critérios dependentes
delas; valores ainda pendentes não devem virar comportamento presumido.

**Prioridade:** P0 é necessária para liberar o fluxo funcional da baseline; P1
fortalece resiliência ou validação antes da conclusão; P2 é melhoria adiável,
sem remover requisito da spec. Neste backlog, P2 limita-se à cobertura ampliada
de breakpoints/navegadores, pois o fluxo mobile principal já está em P0.

**Tamanho relativo:** P (pequeno), M (médio) e G (grande) estimam esforço em
relação às demais tarefas, considerando cenários, fronteiras e incerteza; não
representam dias ou horas.

## Entrega 1 — Decisões e contratos

### T-01 — Resolver decisões bloqueadoras da baseline
- **Tipo:** Infra
- **Prioridade:** P0
- **Tamanho:** G
- **Descrição:** Validar a fonte meteorológica e registrar as decisões necessárias para fechar os contratos: campos mínimos de clima atual e diário, apresentação dos resultados ambíguos, termos/limites/atribuição do provedor e regras pendentes de timeout, atualidade e conversão.
- **Critérios de aceite:** Para cada pergunta aberta bloqueadora aplicável (1–7, 17–21), `specs/weather-app-spec.md` registra decisão aprovada ou status de bloqueio e responsável pela resolução; a decisão sobre a fonte inclui evidência dos termos, cobertura, CORS, limites e atribuição; a spec registra ferramenta/tecnologias assistivas e matriz de navegadores aprovadas ou seu bloqueio; nenhum contrato dependente é marcado como aprovado enquanto houver bloqueio.
- **Dependências:** —
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`
- **Requisitos:** FR-01 a FR-05, NFR-03, NFR-06; AC-01.2, AC-02.4, AC-03.3, AC-04.2, AC-05.4

### T-02 — Definir contratos de domínio e da API
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Criar os tipos internos de cidade, clima, previsão, unidade, estados discriminados e erros, além dos formatos externos mínimos consumidos do provedor aprovado.
- **Critérios de aceite:** A verificação TypeScript em modo strict aceita os contratos; `weather.ts` não importa tipos externos e `openMeteo.ts` contém apenas campos consumidos pelo serviço; os campos opcionais e meteorológicos ausentes aceitam `undefined`/`null` conforme o modelo; os campos da previsão são exatamente os aprovados na T-01.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/types/weather.ts`, `src/types/openMeteo.ts`
- **Requisitos:** FR-01, FR-02, FR-03, FR-05; AC-01.2, AC-02.3, AC-03.4, AC-05.3

## Entrega 2 — Funções puras e normalização

### T-03 — Implementar conversão e formatação de temperatura
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Criar funções puras para converter Celsius para Fahrenheit e formatar valores com a unidade escolhida.
- **Critérios de aceite:** `toFahrenheit(0)`, `toFahrenheit(100)` e `toFahrenheit(-40)` retornam, respectivamente, 32, 212 e -40; formatação aplica a precisão e o arredondamento aprovados na T-01; `null`, `NaN` e infinito não produzem uma temperatura numérica formatada.
- **Dependências:** T-01, T-02
- **Arquivos prováveis:** `src/lib/temperature.ts`
- **Requisitos:** FR-04; AC-04.1, AC-04.2, AC-04.3

### T-04 — Mapear códigos meteorológicos WMO
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Implementar o mapeamento de códigos WMO para descrições em pt-BR usadas na apresentação.
- **Critérios de aceite:** Cada código WMO usado nas respostas current/daily previstas no contrato tem uma descrição pt-BR não vazia; código desconhecido e `null` retornam o mesmo fallback definido; nenhuma dessas entradas lança exceção.
- **Dependências:** T-02
- **Arquivos prováveis:** `src/lib/weatherCode.ts`
- **Requisitos:** FR-02, FR-03; AC-02.1, AC-02.3, AC-03.3, AC-03.4

### T-05 — Tratar datas no fuso da cidade
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Criar utilitários puros para validar e apresentar datas da previsão no fuso informado pelo serviço.
- **Critérios de aceite:** Para a mesma cidade e fixture, executar com dois fusos de dispositivo distintos produz os mesmos cinco valores ISO locais; as datas correspondem a D, D+1, D+2, D+3 e D+4; uma data inválida retorna erro/fallback explícito e não altera a data nem os valores dos outros itens.
- **Dependências:** T-01, T-02
- **Arquivos prováveis:** `src/lib/localDate.ts`
- **Requisitos:** FR-03; AC-03.1, AC-03.2, AC-03.4

### T-06 — Normalizar respostas do provedor
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** G
- **Descrição:** Mapear resultados de geocoding e forecast para os modelos internos, incluindo unidades, dados parciais e alinhamento dos arrays diários por data.
- **Critérios de aceite:** Fixtures válidas mapeiam cada campo contratado para sua propriedade de domínio; todo campo ausente mapeia para `null`; unidade incompatível, estrutura inválida ou cidade/data não associável resulta em erro de resposta inválida; a saída contém cinco datas consecutivas e nenhum valor de uma data é reutilizado em outra.
- **Dependências:** T-02, T-04, T-05
- **Arquivos prováveis:** `src/lib/openMeteoMapper.ts`
- **Requisitos:** FR-01, FR-02, FR-03; AC-01.2, AC-02.3, AC-03.2, AC-03.4, AC-05.3

## Entrega 3 — Services

### T-07 — Implementar busca de cidades
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Implementar `searchCities` no serviço de clima, montando a requisição de geocoding e traduzindo respostas e falhas para contratos internos.
- **Critérios de aceite:** A URL usa o endpoint aprovado e codifica `name` preservando o termo após decodificação; resposta sem resultados retorna `[]`; status HTTP não-2xx e rejeição de rede viram `WeatherError` sem mensagem bruta do provedor; um `AbortSignal` abortado encerra a operação; testes de serviço verificam cada caso.
- **Dependências:** T-01, T-02, T-06
- **Arquivos prováveis:** `src/services/openMeteoService.ts`
- **Requisitos:** FR-01, FR-05; AC-01.1, AC-01.3, AC-01.5, AC-05.3, AC-05.4

### T-08 — Implementar consulta de clima e previsão
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Implementar `getWeather` para consultar condições atuais e previsão diária da cidade selecionada em uma operação.
- **Critérios de aceite:** A URL contém latitude, longitude, variáveis, unidades, fuso e cinco dias conforme o contrato aprovado; a resposta é normalizada pelo mapper; payload parcial válido preserva os valores disponíveis; HTTP não-2xx, rede, timeout e payload inválido retornam o `WeatherErrorKind` correspondente; um `AbortSignal` abortado encerra a operação.
- **Dependências:** T-01, T-02, T-06
- **Arquivos prováveis:** `src/services/openMeteoService.ts`
- **Requisitos:** FR-02, FR-03, FR-05; AC-02.1, AC-02.3, AC-03.1, AC-03.4, AC-05.3, AC-05.4

## Entrega 4 — Hook

### T-09 — Coordenar busca e consulta no hook
- **Tipo:** Data
- **Prioridade:** P0
- **Tamanho:** G
- **Descrição:** Implementar `useWeather` com serviço injetável e estados independentes de busca, clima, cidade selecionada e unidade.
- **Critérios de aceite:** Com serviço fake, busca vazia faz zero chamadas; resultado vazio faz uma chamada de geocoding e zero de forecast; selecionar uma cidade faz uma chamada de forecast; retry repete a mesma operação com os mesmos argumentos; resposta atrasada da cidade A não substitui B; estado inicial da unidade é `celsius` e alterná-la não aumenta a contagem de chamadas.
- **Dependências:** T-03, T-07, T-08
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Requisitos:** FR-01, FR-02, FR-04, FR-05; AC-01.3, AC-02.2, AC-04.1, AC-04.3, AC-05.3, AC-05.5

## Entrega 5 — Componentes

### T-10 — Criar busca e seleção de cidade
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Implementar campo de busca, envio, lista selecionável e distinção de localidades homônimas.
- **Critérios de aceite:** O campo tem nome acessível e mensagem de erro associada por atributo semântico; vazio/espaços exibem exatamente “Informe o nome da cidade.” e não chamam geocoding; cada resultado exibe cidade e região/país disponíveis; todos os resultados podem receber foco e ser selecionados somente pelo teclado.
- **Dependências:** T-02, T-09
- **Arquivos prováveis:** `src/components/CitySearch.tsx`
- **Requisitos:** FR-01, FR-05; AC-01.1, AC-01.2, AC-01.3, AC-01.4, AC-01.5

### T-11 — Exibir condições atuais
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Apresentar cidade, temperatura, descrição da condição e horário de observação/atualização.
- **Fatia de UI solicitada:** Hero `CurrentWeather` com props `city`, `current`, `unit`, ícone de `lib/weatherCodes`, formatação de `lib/temperature` e métricas de umidade, vento, precipitação e pressão na superfície opcional. Cobrir conversão, fallback para dados ausentes/não finitos e códigos WMO desconhecidos; não incluir API nem marcar toda a tarefa como concluída.
- **Critérios de aceite:** Com fixture de sucesso, a tela mostra nome da cidade, temperatura com unidade, descrição e horário de fonte; para cada campo obrigatório nulo mostra exatamente “Sem dados”; nenhuma fixture em loading/erro é renderizada como dado atual.
- **Dependências:** T-02, T-03, T-04, T-09
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`
- **Requisitos:** FR-02, FR-04; AC-02.1, AC-02.3, AC-02.4, AC-04.1, AC-04.2

### T-12 — Exibir previsão de cinco dias
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Apresentar os cinco dias locais consecutivos e os indicadores diários aprovados.
- **Fatia de UI solicitada:** `ForecastList` (`forecast`, `unit`) compõe `ForecastCard` (`day`, `unit`) com grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`. Usar `lib/format` para rótulos de datas locais, `lib/weatherCodes` para ícones e `lib/temperature` para máxima/mínima; incluir probabilidade de chuva, estado vazio e “Sem dados” para leituras ausentes/inválidas. Validar associação de valores/datas em dois fusos; normalização e API ficam fora desta fatia.
- **Critérios de aceite:** A renderização contém exatamente cinco itens com datas locais D a D+4; fixture com valores distintos mostra cada valor no item da data/índice correspondente mesmo sob fuso de dispositivo diferente; cada campo ausente mostra “Sem dados”; todas as temperaturas usam a unidade selecionada.
- **Dependências:** T-03, T-04, T-05, T-09
- **Arquivos prováveis:** `src/components/FiveDayForecast.tsx`
- **Requisitos:** FR-03, FR-04; AC-03.1, AC-03.2, AC-03.3, AC-03.4, AC-04.2, AC-04.3

### T-13 — Implementar alternância de unidade
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Criar controle acessível para alternar entre Celsius e Fahrenheit.
- **Critérios de aceite:** Controle inicia com Celsius selecionado e expõe estado/nome acessível; teclado alterna C→F→C; todos os valores atuais e diários visíveis mudam de unidade e retornam aos valores originais segundo a regra aprovada; cidade e cinco datas permanecem iguais e a contagem de chamadas ao serviço não muda.
- **Dependências:** T-03, T-09
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`
- **Requisitos:** FR-04; AC-04.1, AC-04.2, AC-04.3

### T-14 — Apresentar estados de carregamento, vazio e erro
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Criar apresentação dos estados da busca e da consulta, incluindo ação explícita de nova tentativa.
- **Fatia de UI solicitada:** Componentes independentes em `src/components/states/`: `LoadingState` anuncia “Carregando...” com `role="status"`; `ErrorState` recebe `message` e `onRetry`, apresenta alerta e botão “Tentar novamente”; `EmptyState` recebe `title`/`hint` opcionais com título e dica padrão para busca vazia. Apenas apresentação, sem retry automático, HTTP ou coordenação de promises; testar acionamento único do callback por clique e teclado.
- **Critérios de aceite:** Enquanto a promise está pendente, exibe “Carregando...” e remove essa mensagem ao resolver/rejeitar; resultado vazio exibe “Nenhuma cidade encontrada” e mantém busca editável; erro/timeout exibem alerta com mensagem não vazia e botão “Tentar novamente”; acionar retry invoca uma vez a mesma operação com os mesmos parâmetros.
- **Dependências:** T-09
- **Arquivos prováveis:** `src/components/WeatherStatus.tsx`
- **Requisitos:** FR-05; AC-01.3, AC-05.1, AC-05.2, AC-05.3, AC-05.4, AC-05.5

## Entrega 6 — Integração

### T-15 — Compor a experiência no App
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** G
- **Descrição:** Integrar a primeira fatia do App para busca, seleção, clima atual e estados, sem esperar a previsão de cinco dias ou o toggle.
- **Fatia mock solicitada:** `App` compõe marca, `SearchBar`, `UnitToggle`, clima atual, previsão e estados `idle/loading/empty/error/success`. `useMockWeather` coordena uma busca injetável; `mockWeatherService` retorna a fixture somente para São Paulo (comparação sem distinção de caixa/acentos), ou `null`. `unit` permanece estado do App e não dispara busca. Criar entrada Vite e CSS global; testar loading, vazio, falha, retry, conversão e entrada vazia. Não inclui geocoding, seleção de localidades ou integração Open-Meteo.
- **Critérios de aceite:** Um serviço fake passado ao hook permite pesquisar e selecionar uma cidade e ver temperatura, descrição, horário e estados de loading/vazio/erro; `App.tsx` importa CitySearch, CurrentWeather e WeatherStatus; nenhum componente importa URL, tipo externo ou status HTTP do provedor.
- **Dependências:** T-10, T-11, T-14
- **Arquivos prováveis:** `src/App.tsx`
- **Requisitos:** FR-01, FR-02, FR-05; AC-01.1, AC-02.1, AC-05.1, AC-05.3

### T-16 — Integrar previsão e alternância ao App
- **Tipo:** UI
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Completar o App com a previsão de cinco dias e o controle Celsius/Fahrenheit.
- **Critérios de aceite:** App renderiza FiveDayForecast e TemperatureUnitToggle junto à busca e ao clima atual; os cinco dias permanecem associados às datas locais; alternar a unidade atualiza todos os valores sem nova chamada ao serviço.
- **Dependências:** T-12, T-13, T-15
- **Arquivos prováveis:** `src/App.tsx`
- **Requisitos:** FR-03, FR-04; AC-03.1, AC-03.2, AC-04.1, AC-04.2, AC-04.3

## Entrega 7 — Testes

### T-17 — Testar conversão de temperatura
- **Tipo:** Test
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Testar as funções de conversão e formatação de temperatura.
- **Critérios de aceite:** O arquivo contém asserts para 0 °C→32 °F, 100 °C→212 °F, -40 °C→-40 °F, precisão/arredondamento aprovado e `null`/`NaN`/infinito; `pnpm test -- temperature.test.ts` passa.
- **Dependências:** T-03
- **Arquivos prováveis:** `tests/lib/temperature.test.ts`
- **Requisitos:** FR-04; AC-04.2

### T-18 — Testar mapeamento de códigos meteorológicos
- **Tipo:** Test
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Verificar descrições pt-BR e fallback para códigos WMO desconhecidos.
- **Critérios de aceite:** Cada código WMO usado pelos campos `current` e `daily` tem assert de rótulo; código fora da tabela e `null` têm asserts para o fallback; `pnpm test -- weatherCode.test.ts` passa.
- **Dependências:** T-04
- **Arquivos prováveis:** `tests/lib/weatherCode.test.ts`
- **Requisitos:** FR-02, FR-03; AC-02.1, AC-03.3

### T-19 — Testar datas locais
- **Tipo:** Test
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Verificar interpretação e apresentação das datas da previsão no fuso da cidade.
- **Critérios de aceite:** As mesmas fixtures executadas sob dois fusos de dispositivo retornam as mesmas datas locais; asserts verificam D até D+4 e rejeição de data inválida; `pnpm test -- localDate.test.ts` passa.
- **Dependências:** T-05
- **Arquivos prováveis:** `tests/lib/localDate.test.ts`
- **Requisitos:** FR-03; AC-03.1, AC-03.2

### T-20 — Testar normalização de payloads
- **Tipo:** Test
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Verificar mapeamento dos payloads externos para modelos internos.
- **Critérios de aceite:** Há asserts para payload válido, cada campo ausente como `null`, arrays diários desalinhados, unidade incompatível e cidade/data inválida; a fixture válida produz exatamente cinco datas sem troca de valores entre índices; `pnpm test -- openMeteoMapper.test.ts` passa.
- **Dependências:** T-06
- **Arquivos prováveis:** `tests/lib/openMeteoMapper.test.ts`
- **Requisitos:** FR-01, FR-02, FR-03; AC-01.2, AC-02.3, AC-03.2, AC-03.4, AC-05.3

### T-21 — Testar serviço sem rede externa
- **Tipo:** Test
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Verificar requisições e tratamento de respostas de geocoding e forecast usando `fetch` controlado.
- **Critérios de aceite:** Com `fetch` controlado, asserts verificam endpoint e parâmetros de cada operação; casos cobrem sucesso, geocoding vazio, HTTP não-2xx, rejeição de rede, timeout, abort e JSON inválido; todos os testes passam e nenhuma requisição sai para um host externo.
- **Dependências:** T-07, T-08
- **Arquivos prováveis:** `tests/services/openMeteoService.test.ts`
- **Requisitos:** FR-01, FR-02, FR-03, FR-05; AC-01.3, AC-05.3, AC-05.4

### T-22 — Testar transições e concorrência do hook
- **Tipo:** Test
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Testar o fluxo do hook com um `WeatherService` substituto e respostas controladas.
- **Critérios de aceite:** Testes com serviço fake afirmam as transições `idle→loading→success`, `idle→loading→empty` e `idle→loading→error`; afirmam retry com mesmos argumentos, sucesso parcial, encerramento por abort/timeout e resposta A ignorada após B; `pnpm test -- useWeather.test.ts` passa.
- **Dependências:** T-09
- **Arquivos prováveis:** `tests/hooks/useWeather.test.ts`
- **Requisitos:** FR-01, FR-02, FR-05; AC-02.2, AC-02.3, AC-05.1, AC-05.3, AC-05.4, AC-05.5

### T-23 — Testar busca e seleção de cidade
- **Tipo:** Test
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Testar validação da entrada, resultados e seleção de localidades.
- **Critérios de aceite:** Testing Library/user-event verifica entrada vazia sem callback e mensagem associada, termo com acento preservado, dois resultados homônimos com região/país exibidos e seleção de cada resultado por teclado; `pnpm test -- CitySearch.test.tsx` passa.
- **Dependências:** T-10, T-15
- **Arquivos prováveis:** `tests/components/CitySearch.test.tsx`
- **Requisitos:** FR-01, FR-05; AC-01.1, AC-01.2, AC-01.4, AC-01.5

### T-24 — Testar apresentação do clima atual
- **Tipo:** Test
- **Prioridade:** P0
- **Tamanho:** P
- **Descrição:** Verificar os dados atuais, unidade e tratamento de campos parciais.
- **Critérios de aceite:** Asserções verificam cidade, temperatura/unidade, descrição e horário; fixture sem temperatura ou descrição mostra “Sem dados” para cada campo ausente sem criar número/texto substituto; `pnpm test -- CurrentWeather.test.tsx` passa.
- **Dependências:** T-11, T-15
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`
- **Requisitos:** FR-02, FR-04; AC-02.1, AC-02.3, AC-04.1

### T-25 — Testar apresentação da previsão
- **Tipo:** Test
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Verificar a sequência de dias, associação dos valores e conteúdo parcial da previsão.
- **Critérios de aceite:** Asserções verificam exatamente cinco itens D a D+4, valores distintos sob a data correta, datas no fuso da cidade e “Sem dados” em campo/data ausente; `pnpm test -- FiveDayForecast.test.tsx` passa.
- **Dependências:** T-12, T-16
- **Arquivos prováveis:** `tests/components/FiveDayForecast.test.tsx`
- **Requisitos:** FR-03, FR-04; AC-03.1, AC-03.2, AC-03.4, AC-04.2

### T-26 — Testar alternância de unidade
- **Tipo:** Test
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Verificar interação por teclado e atualização dos valores de temperatura apresentados.
- **Critérios de aceite:** user-event alterna C→F→C; asserções com valores conhecidos verificam todos os valores atuais e previstos após cada troca; cidade e datas permanecem idênticas e o mock do serviço mantém a mesma contagem de chamadas; `pnpm test -- TemperatureUnitToggle.test.tsx` passa.
- **Dependências:** T-13, T-16
- **Arquivos prováveis:** `tests/components/TemperatureUnitToggle.test.tsx`
- **Requisitos:** FR-04; AC-04.1, AC-04.2, AC-04.3

### T-27 — Testar estados da consulta
- **Tipo:** Test
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Verificar mensagens e ações dos estados de carregamento, vazio e erro.
- **Critérios de aceite:** Fixtures pendente, vazia, erro e timeout verificam texto/role de loading, empty e alert; resolução/rejeição remove loading; retry dispara uma única vez com os mesmos parâmetros; `pnpm test -- WeatherStatus.test.tsx` passa.
- **Dependências:** T-14, T-15
- **Arquivos prováveis:** `tests/components/WeatherStatus.test.tsx`
- **Requisitos:** FR-05; AC-05.1, AC-05.2, AC-05.3, AC-05.4, AC-05.5

### T-28 — Cobrir fluxo principal E2E em desktop e mobile
- **Tipo:** Test
- **Prioridade:** P0
- **Tamanho:** G
- **Descrição:** Automatizar o caminho completo de busca, seleção, consulta meteorológica e alternância de unidade em viewports desktop e mobile, com APIs interceptadas.
- **Critérios de aceite:** Playwright executa o mesmo cenário em 1280×800 e 320×800; em ambos, conclui busca→seleção→clima atual→cinco datas→troca C/F e verifica cidade, temperatura, descrição, horário, cinco dias e contagem de requests inalterada ao trocar unidade; nenhuma request alcança host externo.
- **Dependências:** T-16
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`
- **Requisitos:** FR-01, FR-02, FR-03, FR-04, NFR-01; AC-01.1, AC-02.1, AC-03.1, AC-04.1, AC-04.2

### T-29 — Cobrir falhas, vazio e respostas tardias em E2E
- **Tipo:** Test
- **Prioridade:** P1
- **Tamanho:** M
- **Descrição:** Validar continuidade do fluxo perante ausência de resultados, erro/timeout e nova tentativa.
- **Critérios de aceite:** Com rotas interceptadas, asserts verificam zero forecast após geocoding vazio, alerta não vazio e loading removido após falha/timeout, retry com mesmos parâmetros e resposta A tardia sem substituir B; todos os cenários passam sem rede externa.
- **Dependências:** T-15, T-16, T-28
- **Arquivos prováveis:** `tests/e2e/weather-errors.spec.ts`
- **Requisitos:** FR-01, FR-02, FR-05; AC-01.3, AC-02.2, AC-05.2, AC-05.3, AC-05.4, AC-05.5

## Entrega 8 — Hardening

### T-30 — Validar acessibilidade
- **Tipo:** Test
- **Prioridade:** P1
- **Tamanho:** M
- **Descrição:** Verificar teclado, foco e nomes acessíveis nos fluxos principais.
- **Revisão da fatia mock:** Corrigidos foco preservado em loading (`SearchBar.busy` com `aria-disabled` e bloqueio de envio), foco no input inválido e no conteúdo após retry, anúncio persistente de sucesso/vazio/unidade, anel de foco com offset no toggle e borda do input. Cálculo sRGB sobre cores compostas: borda anterior ~1,35:1, nova ~3,73:1; texto secundário ~8,83:1 e texto do toggle ativo ~7,42:1. Adicionados cenários Playwright em 320/768/1280 px para teclado, skip link, foco, colunas, overflow e screenshots. Isso não equivale à auditoria WCAG completa nem resolve a pendência de ferramenta/tecnologia assistiva aprovada na T-01.
- **Limitação da validação:** Cenários E2E listados e tipados, mas execução visual bloqueada pela biblioteca de sistema `libnspr4.so` ausente no container. Após instalar dependências do Chromium, executar `pnpm exec playwright test tests/e2e/weather-accessibility.spec.ts --project=chromium`; complementar com leitor de tela e zoom antes do aceite de acessibilidade.
- **Critérios de aceite:** O fluxo de busca e seleção pode ser concluído sem mouse; testes verificam nome acessível para cada controle interativo e foco visível após Tab; a ferramenta aprovada não reporta violações automáticas nas regras WCAG 2.2 AA verificadas nos estados de busca, sucesso e erro; o relatório registra ferramenta, versão e regras executadas.
- **Dependências:** T-01, T-16, T-28
- **Arquivos prováveis:** `tests/e2e/weather-accessibility.spec.ts`
- **Requisitos:** FR-01, FR-05, NFR-03; AC-01.4, AC-05.3, AC-05.5

### T-31 — Validar responsividade
- **Tipo:** Test
- **Prioridade:** P2
- **Tamanho:** M
- **Descrição:** Verificar o fluxo da aplicação em viewports mobile e desktop.
- **Critérios de aceite:** Playwright verifica `document.documentElement.scrollWidth <= window.innerWidth` nas larguras 320 px, 768 px e 1280 px; campo de busca, resultados, toggle e retry permanecem visíveis e operáveis em cada largura; navegadores adicionais da matriz aprovada têm execução registrada.
- **Dependências:** T-01, T-16, T-28
- **Arquivos prováveis:** `tests/e2e/weather-responsive.spec.ts`
- **Requisitos:** FR-01, FR-05, NFR-01, NFR-06; AC-01.1, AC-05.3

### T-32 — Executar gates de qualidade do projeto
- **Tipo:** Infra
- **Prioridade:** P0
- **Tamanho:** M
- **Descrição:** Confirmar que a implementação integrada passa pelos comandos de lint, build e testes definidos no repositório.
- **Critérios de aceite:** `pnpm lint`, `pnpm build` e `pnpm test` terminam com código 0; a execução de testes usa somente APIs mockadas/interceptadas e não depende de disponibilidade de provedor externo; o resultado dos três comandos é registrado.
- **Dependências:** T-01 a T-31
- **Arquivos prováveis:** `package.json`
- **Requisitos:** FR-01 a FR-05, NFR-01, NFR-03, NFR-05; AC-01.1, AC-02.1, AC-03.1, AC-04.2, AC-05.3

## Rastreabilidade resumida

| Requisito funcional | Tarefas de implementação | Tarefas de teste |
| --- | --- | --- |
| FR-01 — Buscar e selecionar cidades | T-02, T-06, T-07, T-09, T-10, T-15 | T-20, T-21, T-22, T-23, T-28, T-29 |
| FR-02 — Consultar condições atuais | T-02, T-04, T-06, T-08, T-09, T-11, T-15 | T-18, T-20, T-21, T-22, T-24, T-28 |
| FR-03 — Consultar previsão de cinco dias | T-02, T-04, T-05, T-06, T-08, T-09, T-12, T-16 | T-18, T-19, T-20, T-21, T-25, T-28 |
| FR-04 — Alternar unidade de temperatura | T-02, T-03, T-09, T-11, T-12, T-13, T-16 | T-17, T-24, T-25, T-26, T-28 |
| FR-05 — Comunicar estados de busca e consulta | T-02, T-07, T-08, T-09, T-10, T-14, T-15 | T-20, T-21, T-22, T-23, T-27, T-29 |

**Lacunas:** Nenhum dos requisitos funcionais FR-01 a FR-05 está sem tarefa de implementação correspondente. Os indicadores adicionais de FR-02/FR-03 e o limite de atualidade dos dados continuam condicionados às decisões registradas na T-01; isso não deixa os requisitos funcionais sem cobertura para seus critérios mínimos atuais.

## Sequência sugerida — Fatias verticais

1. **Fundação (sem tela):** T-01, T-02. Fechar decisões e contratos para evitar retrabalho nos dados e na API.
2. **Primeiro resultado visível — clima atual:** T-03 a T-11 e T-14; integrar T-15 assim que busca, clima atual e estados estiverem prontos. A pessoa já pode pesquisar uma cidade e ver temperatura, descrição, horário e estados de carregamento/erro/vazio. Rodar T-18, T-20 a T-24 e T-27 como feedback da fatia.
3. **Previsão e unidade:** T-12, T-13 e T-16; a pessoa passa a consultar cinco dias e alternar C/F no App. Validar com T-19, T-25 e T-26.
4. **Fluxo E2E completo:** T-28 percorre o fluxo principal em desktop e mobile; confirma a busca, clima atual, previsão e unidade.
5. **Fechamento de qualidade:** T-29, T-30 e T-32. T-31 (P2) amplia a validação para tablet e navegadores adicionais depois que o fluxo principal desktop/mobile estiver aprovado.

T-27 executa o fluxo principal em desktop e 320 px, portanto cobre o caminho visível da primeira versão em mobile. T-30 permanece como expansão de cobertura (768 px e matriz de navegadores), sem bloquear essa primeira entrega.