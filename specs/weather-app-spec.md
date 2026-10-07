# Especificação de Produto — Aplicação de previsão do tempo

**Status:** Rascunho para validação com stakeholders  
**Fonte:** `specs/discovery.md`  
**Observação:** esta especificação registra decisões iniciais e critérios propostos. As perguntas marcadas como bloqueadoras devem ser resolvidas antes de aprovar a baseline para planejamento.

## Overview

A aplicação permitirá que pessoas consultem o clima atual e a previsão para cinco dias de uma cidade escolhida por busca. O produto deve oferecer uma experiência compreensível em dispositivos móveis e desktop, em português do Brasil, com alternância entre Celsius e Fahrenheit.

O objetivo de produto e os usuários prioritários ainda precisam ser confirmados. As personas disponíveis são hipóteses, não resultados de pesquisa. A primeira versão é considerada sem autenticação ou persistência em servidor; a fonte meteorológica preferida é Open-Meteo, sujeita a validação de cobertura, termos e limites.

## Functional Requirements

**FR-01 — Buscar e selecionar cidades**  
O sistema deve permitir pesquisar uma cidade pelo nome, apresentar os locais correspondentes e permitir a seleção do local desejado. Resultados que possam ser confundidos devem incluir informação suficiente para distingui-los, como região e país.

**FR-02 — Consultar condições atuais**  
Após a seleção de uma cidade, o sistema deve apresentar suas condições atuais com, no mínimo, temperatura e descrição da condição climática. Deve informar o horário da observação ou da atualização conforme fornecido pela fonte. Outros indicadores e a idade máxima aceitável dos dados dependem de decisão de produto.

**FR-03 — Consultar previsão de cinco dias**  
O sistema deve apresentar a previsão da cidade selecionada para cinco datas consecutivas: a data atual local e os quatro dias seguintes. O conjunto mínimo de indicadores por dia permanece pendente de validação.

**FR-04 — Alternar unidade de temperatura**  
O sistema deve permitir alternar entre Celsius e Fahrenheit e aplicar a unidade escolhida a todos os valores de temperatura apresentados. A unidade inicial deve ser Celsius.

**FR-05 — Comunicar estados de busca e consulta**  
O sistema deve comunicar carregamento, ausência de resultados e falha que impeça a busca ou a consulta meteorológica, sem deixar o usuário sem indicação do estado atual.

## User Stories

- **US-01:** Como pessoa que consulta o tempo para decidir a rotina, quero buscar e selecionar minha cidade para consultar as condições do local correto. **Requisito relacionado:** FR-01.
- **US-02:** Como pessoa que consulta o tempo para decidir a rotina, quero ver as condições meteorológicas atuais da cidade selecionada para ajustar meus planos do dia. **Requisito relacionado:** FR-02.
- **US-03:** Como pessoa que planeja compromissos ou viagens, quero consultar a previsão dos próximos cinco dias para organizar minhas atividades. **Requisito relacionado:** FR-03.
- **US-04:** Como pessoa que planeja compromissos ou viagens, quero alternar entre Celsius e Fahrenheit para interpretar a previsão na unidade que prefiro. **Requisito relacionado:** FR-04.
- **US-05:** Como pessoa que consulta o tempo para decidir a rotina, quero ser informada quando a busca ou a consulta estiver carregando, sem resultados ou com falha para saber o estado da consulta e decidir como prosseguir. **Requisito relacionado:** FR-05.

As histórias refletem as personas hipotéticas do discovery e devem ser revistas quando o público prioritário for confirmado.

## Traceability Matrix

| User Story | Requisito funcional | Acceptance Criteria relacionados | Requisitos não funcionais relevantes |
| --- | --- | --- | --- |
| US-01 — Buscar e selecionar cidade | FR-01 | AC-01.1 a AC-01.5; AC-05.1, AC-05.2, AC-05.3 e AC-05.5 | NFR-01 responsividade; NFR-02 fluxo principal; NFR-03 acessibilidade; NFR-04 desempenho; NFR-05 resiliência; NFR-06 compatibilidade; NFR-07 disponibilidade. |
| US-02 — Consultar condições atuais | FR-02 | AC-02.1 a AC-02.4; AC-05.1, AC-05.3, AC-05.4 e AC-05.5 | NFR-01 responsividade; NFR-03 acessibilidade; NFR-04 desempenho; NFR-05 resiliência; NFR-06 compatibilidade; NFR-07 disponibilidade. |
| US-03 — Consultar previsão de cinco dias | FR-03 | AC-03.1 a AC-03.4; AC-05.1, AC-05.3, AC-05.4 e AC-05.5 | NFR-01 responsividade; NFR-03 acessibilidade; NFR-04 desempenho; NFR-05 resiliência; NFR-06 compatibilidade; NFR-07 disponibilidade. |
| US-04 — Alternar unidade de temperatura | FR-04 | AC-04.1 a AC-04.3 | NFR-01 responsividade; NFR-03 acessibilidade; NFR-06 compatibilidade. |
| US-05 — Entender estados da consulta | FR-05 | AC-05.1 a AC-05.5; AC-01.3 e AC-01.4 | NFR-01 responsividade; NFR-03 acessibilidade; NFR-04 desempenho; NFR-05 resiliência; NFR-06 compatibilidade; NFR-07 disponibilidade. |

**Leitura da matriz:** uma faixa de critérios, como “AC-02.1 a AC-02.4”, inclui todos os critérios numerados entre esses limites. NFR-01, NFR-03 e NFR-06 são requisitos transversais da interface; NFR-07 aplica-se às histórias que dependem de consultas ao serviço. Os NFRs marcados como propostas ou pendentes ainda precisam de aprovação para se tornarem critérios finais de teste.

## Acceptance Criteria

Cada critério está expresso como cenário Given/When/Then e pode ser exercitado com respostas controladas. Critérios que dependem de decisões abertas estão marcados; eles só poderão ser automatizados como contrato final após a decisão indicada.

**FR-01 — Busca e seleção**

- **AC-01.1 — Resultados:**
	- **Given:** uma consulta de cidade que retorna uma ou mais localidades;
	- **When:** a pessoa envia a consulta;
	- **Then:** a interface apresenta uma opção selecionável para cada localidade retornada.
- **AC-01.2 — Desambiguação:**
	- **Given:** a busca retorna localidades com o mesmo nome e dados de região ou país distintos;
	- **When:** os resultados são apresentados;
	- **Then:** cada opção exibe o nome da cidade e os campos de região/país disponíveis, permitindo selecionar cada localidade individualmente. **Pendente:** confirmar os campos obrigatórios na pergunta aberta 5.
- **AC-01.3 — Busca sem resultados:**
	- **Given:** a pessoa envia uma consulta, inclusive o nome de uma cidade inexistente, e o geocoding responde com sucesso e uma lista vazia;
	- **When:** a resposta sem correspondências é processada;
	- **Then:** a interface informa “Nenhuma cidade encontrada”, não seleciona uma cidade, não inicia consulta meteorológica e permite editar e reenviar a busca.
- **AC-01.4 — Entrada vazia:**
	- **Given:** o campo de busca está vazio ou contém apenas espaços;
	- **When:** a pessoa tenta enviar a busca;
	- **Then:** a busca não é enviada, nenhuma requisição de geocoding é feita e a mensagem visível “Informe o nome da cidade.” é associada ao campo.
- **AC-01.5 — Caracteres especiais em nomes válidos:**
	- **Given:** o campo contém “São Paulo”, “Aix-en-Provence” ou “St. John's” e o geocoding de teste retorna uma localidade correspondente;
	- **When:** a pessoa envia a busca;
	- **Then:** o termo enviado ao geocoding preserva os caracteres do nome após decodificação, a interface apresenta o resultado retornado como texto e nenhum conteúdo da entrada é executado.

**FR-02 — Condições atuais**

- **AC-02.1 — Dados atuais:**
	- **Given:** uma cidade selecionada e uma resposta válida contendo temperatura, descrição da condição e horário de observação ou atualização;
	- **When:** a consulta é concluída com sucesso;
	- **Then:** a interface identifica a cidade e apresenta a temperatura com sua unidade, a descrição recebida e o horário fornecido pela fonte.
- **AC-02.2 — Troca de cidade:**
	- **Given:** a cidade A está selecionada, depois a pessoa seleciona a cidade B, e as duas solicitações permanecem em andamento;
	- **When:** a resposta de B chega antes da resposta de A;
	- **Then:** a interface apresenta os dados de B e ignora a resposta tardia de A, sem substituir a cidade nem os dados exibidos.
- **AC-02.3 — Condições atuais parciais:**
	- **Given:** uma resposta de condições atuais sem temperatura ou sem descrição da condição;
	- **When:** a resposta é processada;
	- **Then:** os campos válidos são apresentados, cada campo obrigatório ausente é identificado como “Sem dados” e nenhum valor ausente é substituído por um valor inventado.
- **AC-02.4 — Atualidade dos dados:**
	- **Given:** uma resposta com horário de observação ou atualização e a idade máxima de dados aprovada;
	- **When:** a interface recebe a resposta;
	- **Then:** apresenta o horário da fonte e, se a idade exceder o limite aprovado, identifica os dados como desatualizados. **Pendente:** definir o limite na pergunta aberta 20.

**FR-03 — Previsão de cinco dias**

- **AC-03.1 — Período:**
	- **Given:** uma cidade selecionada, sua data local D e uma resposta com previsões para D até D+4;
	- **When:** a previsão é apresentada;
	- **Then:** são exibidas exatamente cinco datas consecutivas, começando em D e terminando em D+4.
- **AC-03.2 — Associação entre data e previsão:**
	- **Given:** previsões com valores distintos associados a datas e a uma cidade de teste com fuso conhecido;
	- **When:** os dados são apresentados;
	- **Then:** cada valor aparece sob a data local correspondente e nenhuma data é deslocada pelo fuso do dispositivo de teste.
- **AC-03.3 — Indicadores por dia:**
	- **Given:** a lista aprovada de indicadores obrigatórios e uma resposta válida para as cinco datas;
	- **When:** a previsão é apresentada;
	- **Then:** cada data exibe todos os indicadores obrigatórios disponíveis para aquele dia, com o rótulo e a unidade definidos para cada indicador. **Bloqueado até aprovação:** lista de indicadores na pergunta aberta 4.
- **AC-03.4 — Previsão parcial:**
	- **Given:** uma resposta de previsão que omite um ou mais campos ou uma ou mais datas do período;
	- **When:** a resposta é processada;
	- **Then:** os valores disponíveis são apresentados nas datas correspondentes, campos ou datas sem valores são identificados como “Sem dados” e nenhum valor é inferido ou copiado de outra data. Se não for possível associar os valores a uma cidade e data válidas, a resposta é tratada como falha conforme AC-05.3.

**FR-04 — Unidade de temperatura**

- **AC-04.1 — Unidade inicial:**
	- **Given:** uma primeira visita sem preferência previamente armazenada;
	- **When:** valores de temperatura são apresentados;
	- **Then:** todos são identificados em Celsius (`°C`).
- **AC-04.2 — Conversão para Fahrenheit:**
	- **Given:** valores atuais e previstos de Celsius conhecidos;
	- **When:** a pessoa seleciona Fahrenheit;
	- **Then:** todos os valores de temperatura visíveis são identificados em Fahrenheit (`°F`) e equivalem a $F = (C \times 9/5) + 32$, aplicando a precisão e a regra de arredondamento aprovadas. **Proposta pendente de aprovação:** uma casa decimal, arredondada para o valor mais próximo (pergunta aberta 21).
- **AC-04.3 — Conversão de volta e contexto:**
	- **Given:** uma cidade e sua previsão exibidas em Fahrenheit;
	- **When:** a pessoa seleciona Celsius;
	- **Then:** os valores voltam a Celsius, enquanto a cidade selecionada e as cinco datas da previsão permanecem iguais.

**FR-05 — Estados da experiência**

- **AC-05.1 — Carregamento:**
	- **Given:** uma busca ou consulta iniciada cuja resposta ainda não chegou;
	- **When:** a solicitação permanece pendente;
	- **Then:** a interface apresenta um indicador de status visível com o texto “Carregando...” até a resposta ser processada.
- **AC-05.2 — Estado vazio:**
	- **Given:** uma busca concluída sem resultados;
	- **When:** a resposta vazia é processada;
	- **Then:** a interface apresenta a mensagem de ausência de resultados definida em AC-01.3 e permite iniciar outra busca.
- **AC-05.3 — Falha:**
	- **Given:** uma busca ou consulta que termina com erro de rede, resposta de erro da API, indisponibilidade do serviço ou payload que não possa ser associado a uma cidade e data válidas;
	- **When:** a falha é processada;
	- **Then:** a interface apresenta um alerta visível com mensagem não vazia, remove o indicador de carregamento, não apresenta dados da tentativa com falha como se fossem atuais e oferece a ação “Tentar novamente” para repetir a mesma operação.

- **AC-05.4 — Timeout:**
	- **Given:** uma busca ou consulta permanece sem resposta além do limite de espera configurado;
	- **When:** o limite é atingido;
	- **Then:** a solicitação é encerrada, o indicador de carregamento é removido e a interface apresenta uma mensagem de timeout com ação “Tentar novamente”. Uma resposta recebida após o encerramento não altera a interface. **Pendente:** definir limites separados para busca e consulta na pergunta aberta 19.
- **AC-05.5 — Continuidade após falha:**
	- **Given:** uma falha apresentada ao usuário;
	- **When:** a pessoa aciona “Tentar novamente”;
	- **Then:** a aplicação repete a mesma operação com os mesmos parâmetros, substitui o estado de erro ao receber resposta e não inicia tentativas automáticas. Política de cache permanece pendente na pergunta aberta 6.

## Non-Functional Requirements

As metas numéricas de responsividade, desempenho, usabilidade e disponibilidade são propostas pelo discovery e precisam de aprovação antes de serem critérios finais de aceite.

- **NFR-01 — Responsividade:** controles e conteúdo devem permanecer utilizáveis sem rolagem horizontal a partir de 320 px, além de se adaptarem a layouts de tablet e desktop.
- **NFR-02 — Usabilidade:** em teste com participantes representativos do público prioritário, após inserir um termo de busca, a pessoa deve conseguir enviar a busca, selecionar uma cidade e visualizar suas condições atuais em até três ações explícitas. Protocolo, recrutamento e tamanho da amostra devem ser definidos na pergunta aberta 22.
- **NFR-03 — Acessibilidade:** os fluxos de busca e consulta devem atender ao WCAG 2.2 nível AA, incluindo operação por teclado, foco visível, nomes acessíveis e contraste adequado. As tecnologias assistivas e o método de validação ainda devem ser acordados.
- **NFR-04 — Desempenho:** proposta de LCP de até 2,5 s no percentil 75 em dispositivos móveis. Após a resposta do provedor meteorológico, a interface deve apresentar os dados em até 1 s. Os dispositivos, condições de rede, região e ferramenta de medição serão os aprovados na pergunta aberta 15; a meta permanece proposta até essa definição.
- **NFR-05 — Resiliência:** falhas de rede ou do serviço de dados devem gerar uma mensagem compreensível e não deixar a interface em estado indefinido. Não há requisito confirmado de funcionamento offline; validade e apresentação de dados em cache permanecem pendentes.
- **NFR-06 — Compatibilidade:** a aplicação deve funcionar nos navegadores e sistemas operacionais da matriz de suporte a ser aprovada. Versões mínimas ainda não estão definidas.
- **NFR-07 — Disponibilidade:** meta proposta de 99,5% de disponibilidade mensal da aplicação, excluindo indisponibilidade do provedor externo. A meta, a fronteira de medição, a responsabilidade operacional e a contabilização de falhas externas dependem da definição de hospedagem e operação.

## Edge Cases

- **Cidade inexistente:** informar “Nenhuma cidade encontrada”, não iniciar a consulta meteorológica e permitir editar o termo (AC-01.3).
- **Geocoding sem resultados:** usar o mesmo estado vazio de AC-01.3; não selecionar cidade nem iniciar consulta meteorológica.
- **Input vazio ou só com espaços:** bloquear o envio, não chamar geocoding e associar ao campo a mensagem “Informe o nome da cidade.” (AC-01.4).
- **Caracteres especiais:** preservar e codificar acentos, espaços, hífens e apóstrofos de nomes válidos; renderizar o retorno como texto e não executar conteúdo da entrada (AC-01.5).
- **Falha de API ou rede:** encerrar carregamento, exibir alerta não vazio, não tratar dados da tentativa com erro como atuais e oferecer “Tentar novamente” para repetir a mesma operação (AC-05.3 e AC-05.5).
- **Timeout:** encerrar a solicitação ao atingir o limite configurado, remover o indicador de carregamento, informar timeout e permitir nova tentativa. O limite depende da pergunta aberta 19 (AC-05.4).
- **Resposta meteorológica parcial:** apresentar valores disponíveis, marcar campos/datas sem dados como “Sem dados” e não inferir nem reutilizar valores de outros dias. Rejeitar dados que não possam ser associados à cidade e data (AC-02.3, AC-03.4 e AC-05.3).
- **Várias cidades com o mesmo nome:** apresentar informação de desambiguação; não selecionar silenciosamente um resultado ambíguo.
- **Cidade alterada durante consulta em andamento:** ignorar respostas de seleções anteriores que cheguem depois da resposta da seleção atual (AC-02.2).
- **Virada do dia ou diferença de fuso entre usuário e cidade:** os cinco dias permanecem ancorados na data local da cidade selecionada.
- **Falha ao converter uma temperatura:** não exibir um valor inválido com unidade como se fosse válido; indicar o campo como indisponível.
- **Dados meteorológicos possivelmente defasados:** exibir o horário informado pela fonte e identificar dados que excedam a idade máxima aprovada como desatualizados; definir essa idade na pergunta aberta 20.
- **Recusa ou indisponibilidade de localização do dispositivo:** não bloqueia a busca manual; a localização automática não está incluída na direção inicial.

## Assumptions

- A aplicação é uma experiência web responsiva como baseline de trabalho; a necessidade de PWA ou aplicativo nativo está em aberto.
- O fluxo inicial começa por busca manual de cidade; não foi solicitada localização automática.
- A aplicação depende de internet para consultar dados atualizados; suporte offline não está confirmado.
- A interface inicial será em português do Brasil e a unidade padrão será Celsius.
- O período de cinco dias corresponde à data local da cidade selecionada e aos quatro dias seguintes.
- A primeira versão não terá autenticação nem persistência de dados de usuário em servidor. Persistência local, preferências, cache e histórico ainda não estão definidos.
- Open-Meteo é a fonte proposta, sem chave de API, e não uma escolha operacional validada.
- As personas e metas de sucesso descritas no discovery são hipóteses, não evidência de pesquisa nem compromisso de negócio.

## Risks

| Risco | Impacto potencial | Mitigação ou decisão necessária |
| --- | --- | --- |
| Limites, termos, cobertura ou disponibilidade do provedor não atendem às necessidades. | Mudança de fonte, custos ou indisponibilidade do produto. | Validar uso permitido, atribuição, cobertura, limites e garantias antes de fechar a integração. |
| Dados meteorológicos imprecisos ou desatualizados. | Perda de confiança e interpretação equivocada das condições. | Confirmar qualidade e atualização da fonte; decidir como indicar horário e defasagem dos dados. |
| Cidade homônima selecionada incorretamente. | Consulta de previsão para local diferente do pretendido. | Exibir informações suficientes para desambiguação e validar casos com localidades homônimas. |
| Público, objetivo e limites do MVP indefinidos. | Priorização incorreta, expansão de escopo e atraso. | Confirmar usuário prioritário, métrica de sucesso e itens dentro/fora da primeira versão. |
| Conteúdo e granularidade da previsão não definidos. | Retrabalho de experiência, integração e critérios de teste. | Aprovar os indicadores mínimos e o formato temporal antes de fechar a baseline da spec. |
| Fuso ou conversão de unidade inconsistentes. | Datas e temperaturas potencialmente incorretas. | Confirmar regra de data local, precisão e arredondamento; validar limites de dia e conversões. |
| Regras de privacidade para localização e persistência indefinidas. | Coleta excessiva, surpresa para o usuário ou risco de conformidade. | Definir dados coletados, finalidade, consentimento, retenção e armazenamento antes de habilitar localização ou persistência. |
| Usuário interpretar previsão comum como alerta oficial. | Decisão de segurança baseada em uma funcionalidade não oferecida. | Confirmar se alertas estão fora do MVP e comunicar claramente os limites do produto. |
| Metas de desempenho e disponibilidade sem cenário ou responsável de operação. | Critérios não testáveis ou compromisso sem sustentação operacional. | Aprovar cenários de medição, hospedagem, monitoramento e fronteira de disponibilidade. |
| Suporte regional, acessibilidade e navegadores não validados. | Exclusão de usuários e retrabalho tardio. | Aprovar idiomas/regiões, matriz de compatibilidade e validação assistiva antes do aceite final. |

## Out of Scope

Os itens abaixo não fazem parte da baseline inicial, salvo aprovação explícita de escopo:

- Autenticação, contas de usuário e persistência de dados em servidor.
- Alertas meteorológicos severos ou avisos oficiais de emergência.
- Mapas meteorológicos.
- Localização automática do dispositivo; busca manual permanece o fluxo inicial.
- Histórico, cidades salvas, favoritos ou alternância persistente entre locais.
- Funcionamento offline ou garantia de exibir dados armazenados em cache.
- Aplicativo nativo ou instalação como PWA; a decisão de plataforma ainda está aberta.
- Idiomas diferentes de pt-BR na primeira experiência, salvo decisão posterior de internacionalização.

Esta lista é provisória: o escopo final depende da confirmação do MVP e das perguntas abertas.

## Open Questions

**Bloqueadoras para aprovar a baseline de planejamento**

1. Qual problema de negócio é prioritário, quem são os usuários principais e como será medido o sucesso?
2. Quais funcionalidades entram no MVP e quais exclusões desta spec devem ser confirmadas?
3. Open-Meteo atende a cobertura, termos, atribuição, limites de uso e requisitos operacionais? Se não, qual fonte será avaliada?
4. Quais campos devem ser exibidos para clima atual e qual é o conjunto mínimo de campos e granularidade para cada dia da previsão?
5. Como a busca é iniciada, quais idiomas e tolerância a erros são esperados e quais dados identificam resultados ambíguos?
6. Qual comportamento deve ocorrer diante de falha parcial, timeout, indisponibilidade e dados em cache: nova tentativa, idade máxima, indicação de defasagem ou nenhum fallback?
7. Quais dados podem ser coletados ou armazenados, incluindo localização, buscas, preferências e cache; para qual finalidade, por quanto tempo e com qual consentimento?

**Podem ser resolvidas durante o detalhamento, desde que registradas como premissas**

8. A experiência será somente web responsiva, PWA ou incluirá aplicativo nativo?
9. A localização do dispositivo será oferecida? Se sim, quando será solicitada e qual alternativa existirá após recusa ou falha?
10. O produto oferecerá cidades salvas, recentes ou histórico?
11. Com que frequência os dados serão atualizados e como será exibido o horário da última atualização?
12. Celsius e Fahrenheit serão as únicas unidades? Qual precisão e arredondamento serão usados, e a preferência persistirá entre visitas?
13. Quais fuso horário, formatos de data/hora e convenções regionais serão usados para pt-BR?
14. Alertas severos serão explicitamente excluídos ou exigem uma fonte e requisitos próprios?
15. Quais dispositivos, condições de rede, regiões e método de medição serão usados para validar desempenho e usabilidade?
16. Qual meta de disponibilidade será aprovada, como serão contabilizadas falhas do provedor e quem responde por operação e monitoramento?
17. Quais tecnologias assistivas serão usadas na validação de WCAG 2.2 AA?
18. Quais navegadores, versões, sistemas operacionais e larguras mínimas compõem a matriz suportada?
19. Quais são os limites de espera separados para busca e consulta meteorológica, e como tratar respostas recebidas após timeout?
20. Qual é a idade máxima aceitável para dados atuais antes de identificá-los como desatualizados, e qual horário da fonte será exibido?
21. Qual precisão decimal e regra de arredondamento serão usadas para Celsius e Fahrenheit?
22. Como será medido o limite de três ações de usabilidade, incluindo perfil/recrutamento de participantes, tamanho da amostra e quais interações contam como ação?

As respostas devem ser registradas como decisões ou premissas aprovadas antes de transformar metas propostas e comportamentos pendentes em critérios finais de aceite.