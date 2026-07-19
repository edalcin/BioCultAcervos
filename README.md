# BioCultAcervos

Registro de evidências da relação de comunidades tradicionais com a biodiversidade, presentes em **acervos históricos e museológicos**.

[![GitHub](https://img.shields.io/badge/GitHub-BioCultAcervos-181717?logo=github)](https://github.com/edalcin/BioCultAcervos)

> **Status**: Fase inicial — apenas repositório e documentação.

---

## O que é o BioCultAcervos?

O **BioCultAcervos** é o componente da [Arquitetura BioCultural](https://github.com/edalcin/Arquitetura-BioCultural) dedicado a registrar e tornar rastreáveis as evidências de conhecimento tradicional associado à biodiversidade preservadas em coleções, registros e documentos de **museus e acervos históricos** — uma fonte complementar às fontes secundárias (artigos científicos, via [BioCultDB](https://github.com/edalcin/BioCultDB)), primárias (registro de campo, via [BioCultRelatos](https://github.com/edalcin/BioCultRelatos)) e às obras de naturalistas (via [BioCultNaturalistas](https://github.com/edalcin/BioCultNaturalistas)).

## Posição na Arquitetura Federada

Na arquitetura federada da [Arquitetura BioCultural](https://github.com/edalcin/Arquitetura-BioCultural), o BioCultAcervos será o componente central de um novo tipo de membro — **Acervos Históricos e Museológicos** — seguindo o mesmo padrão de soberania dos demais membros: container próprio, arquivo SQLite+JSON compartilhado com uma instância soberana do [BioCultTermos](https://github.com/edalcin/BioCultTermos), e endpoint de harvest REST para o [Pluriverso](https://github.com/edalcin/pluriverso). A camada semântica dessa instância é gerida pelo BioCultTermos embutido (vocabulários soberanos do membro); o Pluriverso unifica essa camada com as dos demais membros por meio de mapeamentos SKOS-XL (`skos:exactMatch`, `skos:closeMatch`, `skos:broadMatch`), sem jamais assumir a posse dos vocabulários.

**Integração técnica com BioCultTermos**: via git submodule, seguindo o mesmo padrão já em produção no BioCultDB e planejado no BioCultRelatos — repositório único compartilhado entre as unidades, congelado como produto standalone (ver [ADR-007](https://github.com/edalcin/Arquitetura-BioCultural/blob/main/docs/architecture-decisions/ADR-007-shared-bioculttermos-module.md) da Arquitetura BioCultural). Detalhes desta integração específica em `docs/decisions/ADR-001-integracao-bioculttermos.md` e `integracao.md`.

## Princípios C.A.R.E.

Assim como os demais componentes da federação, o BioCultAcervos respeitará pleno e absolutamente os princípios **C.A.R.E.** (Collective Benefit, Authority to Control, Responsibility, Ethics): mesmo quando a evidência vem de um acervo histórico ou museológico, a autoridade sobre como o conhecimento tradicional nela descrito é registrado e compartilhado permanece com a comunidade a que ele se refere.

## Contato

[GitHub Issues](https://github.com/edalcin/BioCultAcervos/issues) · edalcin@jbrj.gov.br

---

## Agradecimentos

A formulação desta proposta técnica e a consolidação de sua visão ética e conceitual não seriam possíveis sem os diálogos, provocações e insights preciosos de parceiros fundamentais. Registro meu profundo agradecimento à Viviane Fonseca, do Jardim Botânico do Rio de Janeiro (JBRJ); ao Lucas Zelesco, da Fundação Nacional dos Povos Indígenas (FUNAI); e aos membros do Comitê Gestor Useflora, cuja dedicação à salvaguarda da sociobiodiversidade e ao respeito às comunidades tradicionais inspirou cada linha de código e de arquitetura deste projeto.
