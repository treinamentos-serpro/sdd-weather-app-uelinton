# Discovery — Aplicação de previsão do tempo

## Resumo Executivo

A aplicação permitirá consultar o clima atual e a previsão de cinco dias para uma cidade, em dispositivos móveis e desktop.
Usuários poderão buscar e selecionar cidades e alternar entre Celsius e Fahrenheit.
A direção inicial prevê interface em português do Brasil, Celsius por padrão e sem contas de usuário.
O provedor de dados e as metas operacionais ainda dependem de validação; conteúdo da previsão, privacidade e tratamento de falhas também precisam ser definidos.
Antes de fechar a especificação, é necessário confirmar o público prioritário, o objetivo do produto e o escopo da primeira versão.

## Contexto

A empresa precisa de uma aplicação de previsão do tempo para pessoas que desejam consultar as condições de uma cidade e planejar os próximos dias. A experiência deve permitir localizar cidades, consultar o clima atual e a previsão de cinco dias, alternar as unidades de temperatura e funcionar adequadamente em dispositivos móveis.

O briefing não define público específico, plataforma além do suporte móvel, nível de detalhe meteorológico, política de localização ou persistência das preferências. Há decisões iniciais registradas abaixo, mas algumas dependem de validação. A especificação pode começar com premissas explícitas; não deve fechar escopo, critérios de aceite ou compromissos operacionais enquanto as decisões bloqueadoras não forem confirmadas.

## Requisitos Funcionais

- **RF1 — Busca de cidades:** permitir que o usuário pesquise uma cidade pelo nome e selecione o local correto quando houver resultados ambíguos.
- **RF2 — Clima atual:** apresentar as condições atuais da cidade selecionada, incluindo ao menos temperatura e descrição da condição climática. Os demais indicadores ainda precisam ser definidos.
- **RF3 — Previsão de cinco dias:** apresentar a previsão para hoje e os quatro dias seguintes, considerando a data local da cidade selecionada. Os dados e a granularidade apresentados por dia ainda precisam ser definidos.
- **RF4 — Unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit e refletir a unidade escolhida nos valores de temperatura exibidos.
- **RF5 — Estados da experiência:** informar quando a busca ou a previsão estiver carregando, quando não houver resultados e quando ocorrer uma falha que impeça a consulta.

## Requisitos Não-Funcionais

As metas numéricas abaixo são propostas iniciais de discovery e devem ser confirmadas com as partes interessadas antes de se tornarem critérios finais de aceite.

- **RNF1 — Responsividade:** a aplicação deve manter conteúdo e controles utilizáveis, sem rolagem horizontal, em larguras a partir de 320 px e em layouts de tablet e desktop.
- **RNF2 — Usabilidade:** no fluxo principal, após inserir um termo de busca, o usuário deve conseguir selecionar uma cidade e consultar o clima atual em até três ações adicionais. Validar esse fluxo em teste de usabilidade.
- **RNF3 — Acessibilidade:** atender ao WCAG 2.2 nível AA nos fluxos de busca e consulta, incluindo operação por teclado, foco visível, nomes acessíveis para controles e contraste adequado.
- **RNF4 — Desempenho:** em dispositivos móveis e condições de rede definidas, atingir LCP de até 2,5 s no percentil 75. Após a resposta do provedor meteorológico, a interface deve apresentar os dados em até 1 s.
- **RNF5 — Resiliência:** falhas de rede ou do serviço de dados devem produzir uma mensagem compreensível, sem deixar a interface em estado indefinido. A política de nova tentativa e o uso, prazo de validade e identificação de dados em cache devem ser definidos na especificação; não se presume suporte offline.
- **RNF6 — Compatibilidade:** funcionar nos navegadores e sistemas definidos como suportados; a matriz de versões mínimas ainda precisa ser acordada.
- **RNF7 — Disponibilidade (meta proposta):** buscar disponibilidade mensal de 99,5% para a aplicação, excluindo indisponibilidade do provedor externo. A meta, a fronteira de medição, o responsável operacional e a forma de contabilizar falhas externas precisam ser acordados após definir hospedagem e operação. A dependência externa deve ser monitorada e, em caso de falha, a aplicação deve seguir o comportamento de resiliência definido para o RNF5.

## Riscos

| Risco | Probabilidade | Impacto | Estratégia de mitigação |
| --- | --- | --- | --- |
| Indisponibilidade, latência ou limites de uso do provedor meteorológico/geocodificação. | Média | Alto: buscas ou previsões podem ficar indisponíveis; limites e custos podem inviabilizar a solução. | Avaliar cobertura, SLA, limites, custos e termos antes da escolha; monitorar falhas, tratar timeouts e definir contingência com cache claramente marcado como desatualizado. |
| Dados meteorológicos imprecisos ou defasados. | Média | Alto: usuários podem tomar decisões com informações incorretas ou acreditar que dados antigos são atuais. | Avaliar qualidade e frequência de atualização da fonte; exibir horário da última atualização e comunicar falhas ou defasagem. |
| Resultados ambíguos podem levar à seleção da cidade errada. | Alta | Médio: a previsão não corresponderá ao local desejado e reduzirá a confiança no produto. | Exibir região/estado e país nos resultados e validar buscas com cidades homônimas, entradas inválidas e ausência de resultados. |
| Público, objetivo de negócio e escopo da primeira versão não estão definidos. | Alta | Alto: o produto pode não resolver a necessidade prioritária ou sofrer expansão de escopo e atrasar. | Validar usuários, casos de uso, métricas de sucesso e limites do MVP antes de fechar especificação e prioridades. |
| A experiência pode não funcionar bem em telas pequenas ou para pessoas com deficiência. | Média | Alto: usuários podem não conseguir completar o fluxo principal, especialmente em dispositivos móveis. | Projetar mobile-first; definir critérios de responsividade e acessibilidade e testar com teclado, leitor de tela e diferentes tamanhos de tela. |
| Erros de unidade, fuso horário ou interpretação dos cinco dias podem exibir valores ou datas incorretos. | Média | Alto: a previsão pode ser mal interpretada e orientar decisões equivocadas. | Definir unidades, fuso, limites do período e formato diário; testar conversões, virada de data e apresentação em diferentes regiões. |
| Desempenho lento em redes móveis. | Média | Médio a alto: aumenta o abandono e prejudica consultas rápidas. | Estabelecer metas de desempenho e cenários de medição; acompanhar métricas em dispositivos e redes representativos e otimizar carregamento e chamadas externas. |
| Uso de localização, histórico ou preferências sem regras claras de privacidade. | Baixa a média | Alto: coleta excessiva pode reduzir a confiança e gerar risco de conformidade. | Solicitar consentimento para localização; minimizar dados e definir finalidade, retenção, exclusão e armazenamento antes de implementar persistência. |
| Usuários podem esperar alertas de emergência que o app não oferece. | Média | Alto: a previsão comum pode ser confundida com aviso oficial de segurança. | Decidir explicitamente se alertas severos estão no escopo; se não estiverem, comunicar os limites do serviço e não sugerir cobertura emergencial. |
| Idioma, formatos de data e convenções regionais podem não corresponder ao público. | Média | Médio: termos ou datas podem ser interpretados incorretamente, reduzindo compreensão e adoção. | Definir regiões e idiomas suportados; validar tradução, fuso horário e formatos com usuários representativos. |

## Perguntas em Aberto

As perguntas abaixo devem ser respondidas ou explicitamente adiadas antes de fechar o escopo. Os impactos indicam o custo provável de seguir sem decisão; não significam que toda possibilidade sugerida já faça parte da versão inicial.

#### Decisões necessárias para estabelecer a baseline da spec

Antes de tratar a especificação como baseline para planejamento, confirmar:

- **Objetivo, usuários prioritários e limites do MVP:** perguntas 1, 2 e 4.
- **Viabilidade do provedor e conteúdo meteorológico mínimo:** perguntas 9, 10, 11 e 12.
- **Fluxo de busca e identificação do local:** perguntas 5 e 6; decidir também se localização do dispositivo entra no escopo (pergunta 7).
- **Privacidade e comportamento em falhas:** perguntas 18, 21 e 22; incluir a pergunta 8 se histórico ou cidades salvas forem considerados.

As demais questões podem permanecer abertas durante a elaboração inicial se a spec registrar a premissa adotada, o impacto de uma mudança e quando a decisão será necessária. Nenhuma meta ou integração provisória deve ser apresentada como compromisso confirmado.

### Objetivo e usuários

1. **Pergunta:** Qual problema de negócio a aplicação deve resolver e como será medido o sucesso (por exemplo, consultas concluídas, uso recorrente ou satisfação)? **Impacto:** sem um resultado esperado, não há base para priorizar funcionalidades nem avaliar se o produto entregou valor.
2. **Pergunta:** Quem são os usuários prioritários e em quais situações consultarão o tempo (planejamento, decisão imediata, viagem ou outro uso)? **Impacto:** público e contexto afetam conteúdo, prioridade mobile, densidade das informações e escolhas de UX.
3. **Pergunta:** O produto será apenas um web app responsivo ou também deverá ser instalável como PWA ou distribuído como app nativo? **Impacto:** a resposta altera arquitetura, recursos de dispositivo, estratégia de publicação, testes e custo de manutenção.
4. **Pergunta:** Qual é o escopo da primeira versão e o que está explicitamente fora dele (por exemplo, alertas meteorológicos, mapas, múltiplas cidades ou personalização)? **Impacto:** sem limites, o escopo pode crescer e atrasar a entrega do fluxo principal.

### Busca, cidades e localização

5. **Pergunta:** Como a busca deve funcionar: envio após digitação, sugestões instantâneas, tolerância a erros e busca em quais idiomas? **Impacto:** isso determina a interação, os requisitos de geocodificação e o comportamento esperado para entradas sem resultado.
6. **Pergunta:** Quais informações devem identificar uma cidade entre homônimas (estado, região, país ou coordenadas)? **Impacto:** sem desambiguação suficiente, o usuário pode consultar a previsão do local errado.
7. **Pergunta:** A localização do dispositivo deve ser oferecida? Se sim, será opcional, quando será solicitada e qual alternativa haverá em caso de recusa ou indisponibilidade? **Impacto:** isso afeta permissões, privacidade, fluxo inicial e a possibilidade de usar o app sem localização.
8. **Pergunta:** O usuário poderá salvar cidades, consultar histórico ou alternar entre locais recentes? **Impacto:** a decisão altera navegação, armazenamento, persistência entre sessões e requisitos de privacidade.

### Dados meteorológicos e apresentação

9. **Pergunta:** Quais são os limites de uso, custos, licenças, requisitos de atribuição e garantias de serviço do Open-Meteo? **Impacto:** sem isso, não é possível validar viabilidade operacional, estimar restrições ou definir a disponibilidade esperada dos dados.
10. **Pergunta:** O que significa “clima atual”: quais campos devem aparecer, com que unidade e com qual horário de referência? **Impacto:** sem um conjunto mínimo de dados, design, integração e critérios de aceite podem divergir.
11. **Pergunta:** Para cada um dos cinco dias definidos em RF3, a previsão deve apresentar quais campos e granularidade (por exemplo, resumo diário, máximas/mínimas, períodos do dia ou dados horários)? **Impacto:** a resposta muda o contrato da API, o modelo de dados, o layout e a interpretação da previsão.
12. **Pergunta:** Com que frequência os dados devem ser atualizados e como será indicada a hora da última atualização? **Impacto:** sem uma regra de atualização, dados podem parecer atuais quando estão defasados ou gerar chamadas e custos desnecessários.
13. **Pergunta:** Celsius e Fahrenheit são as únicas unidades alternáveis, e a escolha do usuário deve persistir entre visitas ou dispositivos? **Impacto:** isso define as opções de conversão, rótulos e se será necessário armazenar a preferência localmente ou em servidor.
14. **Pergunta:** Quais fuso horário, formato de data e convenções regionais devem ser usados na interface pt-BR? **Impacto:** escolhas inconsistentes podem exibir dias ou horários incorretos e tornar a interface inadequada para o público atendido.
15. **Pergunta:** O app deve apresentar alertas de condições severas ou será apenas informativo, sem orientar decisões de segurança? **Impacto:** incluir alertas exige fontes adequadas, atualização e tratamento de responsabilidade; excluí-los deve evitar expectativa de cobertura emergencial.

### Qualidade, operação e privacidade

16. **Pergunta:** Quais são os limites aceitáveis de latência para busca e previsão, em quais dispositivos e condições de rede serão medidos? **Impacto:** sem cenário e metas acordados, desempenho não pode ser testado objetivamente nem orientará decisões de cache e otimização.
17. **Pergunta:** Qual disponibilidade é necessária e como será contabilizada a indisponibilidade do provedor meteorológico? **Impacto:** sem uma meta e uma fronteira de medição, não há critério operacional claro nem base para decidir sobre redundância ou degradação graciosa.
18. **Pergunta:** O app deve funcionar sem conexão ou mostrar dados armazenados? Se sim, por quanto tempo os dados são considerados aceitáveis e como serão marcados como desatualizados? **Impacto:** isso altera cache, armazenamento local, privacidade e a semântica de “clima atual”.
19. **Pergunta:** Quais requisitos de acessibilidade são obrigatórios, incluindo padrão de conformidade e tecnologias assistivas a validar? **Impacto:** deixar isso para o fim pode exigir retrabalho em estrutura, navegação e componentes.
20. **Pergunta:** Quais navegadores, versões, sistemas operacionais e larguras mínimas devem ser suportados? **Impacto:** sem uma matriz, cobertura de testes e compatibilidade ficam indefinidas; decisões de implementação podem excluir parte do público esperado.
21. **Pergunta:** Há requisitos de segurança ou privacidade para localização, histórico e preferências, incluindo consentimento, retenção e exclusão? **Impacto:** sem regras, pode haver coleta excessiva, comportamento inesperado para o usuário ou risco de não conformidade.
22. **Pergunta:** Qual comportamento é esperado para falhas de busca, falta de resultados, timeout ou indisponibilidade da fonte: nova tentativa, dados em cache ou outro caminho? **Impacto:** sem definição, as falhas produzem experiências inconsistentes e não há critérios claros para validar resiliência.

## Decisões e premissas

As decisões abaixo registram a direção atual do produto, não substituem validações pendentes. Itens explicitamente sujeitos a validação devem permanecer como premissas na spec até serem confirmados.

- **Fonte de dados proposta: Open-Meteo, sem API key, sujeita a validação.** A ausência de chave simplifica a integração inicial, mas não confirma a viabilidade do provedor. **Permanece em aberto:** limites de uso, termos, atribuição, garantias de serviço e cobertura da fonte (pergunta 9). Não fechar o contrato de integração antes dessa verificação.
- **Previsão de cinco dias: hoje mais os quatro dias seguintes.** Essa definição dá um intervalo consistente para apresentação da previsão. **Resolve:** se o dia atual conta entre os cinco dias (pergunta 11). **Permanece em aberto:** granularidade e campos exibidos em cada dia.
- **Unidade padrão: Celsius.** A escolha oferece um padrão inicial coerente com o público pt-BR; a alternância para Fahrenheit continua prevista no RF4. **Resolve:** qual unidade exibir na primeira consulta (pergunta 13). **Permanece em aberto:** se a escolha posterior do usuário deve ser persistida.
- **Sem autenticação e sem persistência de servidor.** A primeira versão não terá contas nem armazenará preferências ou dados de usuário em um servidor, reduzindo escopo e necessidade de gestão de dados. **Resolve:** se haverá login e persistência associada a contas. **Permanece em aberto:** eventual armazenamento local no dispositivo, cache e tratamento de dados de localização.
- **Idioma da interface: português do Brasil (pt-BR).** Isso define o idioma padrão para textos e mensagens do produto. **Resolve:** qual idioma usar na interface (pergunta 14). **Permanece em aberto:** fuso horário, formatos regionais de data e hora e convenções de unidades além da temperatura.

## Personas (Hipóteses)

Estas personas são hipóteses derivadas do briefing, não perfis confirmados por pesquisa com usuários. As métricas abaixo são sinais qualitativos para validação, não critérios de aceite da spec.

### Pessoa que consulta o tempo para decidir a rotina

- **Objetivo principal:** entender rapidamente as condições atuais e decidir se precisa ajustar os planos do dia, como escolher roupa ou levar guarda-chuva.
- **Contexto de uso:** principalmente em dispositivo móvel, em consultas breves ao longo do dia.
- **Métrica de sucesso percebida:** localizar a cidade e compreender o clima atual em menos de 30 segundos, sem precisar repetir a busca.

### Pessoa que planeja compromissos ou viagens

- **Objetivo principal:** consultar a previsão dos próximos cinco dias para decidir quando viajar ou como organizar atividades.
- **Contexto de uso:** desktop para planejar com mais atenção e mobile para conferir a previsão durante o deslocamento.
- **Métrica de sucesso percebida:** consultar os cinco dias da cidade escolhida e considerar que tem informação suficiente para decidir, sem recorrer a outra fonte.

## Suposições

- O usuário inicia a consulta escolhendo uma cidade por busca; não foi solicitada localização automática.
- A aplicação depende de acesso à internet para obter dados atualizados.
