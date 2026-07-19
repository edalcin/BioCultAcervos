# ADR-001: Integração operacional do BioCultTermos na unidade Acervos Históricos e Museológicos

## Status

**Aceito** (decisão de padrão, implementação diferida) — Julho 2026

## Contexto

A Arquitetura BioCultural v3.2 (`Arquitetura-BioCultural/docs/architecture-decisions/ADR-004-federated-architecture.md`
e `ADR-005-sqlite-json-persistence.md`) já define, no nível arquitetural, que toda unidade **Acervos
Históricos e Museológicos** membro da federação opera uma unidade com **um único container** rodando
BioCultAcervos (registro de evidências de conhecimento tradicional preservadas em coleções, registros e
documentos de museus/arquivos históricos) e **BioCultTermos** (vocabulário SKOS-XL soberano do acervo)
sobre **um único arquivo SQLite compartilhado**.

Em 2026-07-12, a mesma integração foi planejada e documentada para a unidade "Fontes Secundárias"
(BioCultDB + BioCultTermos) — ver `BioCultDB/integracao.md` e `BioCultDB/docs/decisions/ADR-001-integracao-bioculttermos.md`
— e, na mesma sessão, replicada para a unidade "Comunidade Tradicional" (BioCultRelatos + BioCultTermos)
— ver `BioCultRelatos/integracao.md` e `BioCultRelatos/docs/decisions/ADR-001-integracao-bioculttermos.md`.
Essas sessões serviram de sessão de grilling **e** de modelo de implementação real (scaffold Docker
multi-stage, submodule, entrypoint dual-processo, todos já testados e funcionando para BioCultDB). Esta
ADR replica os **princípios** dessa integração para o BioCultAcervos, adaptando-os às diferenças reais
entre as unidades — não é uma cópia mecânica.

**BioCultAcervos ainda não tem código** (`README.md:7`: "Fase inicial — apenas repositório e
documentação") — nenhum `backend/`, nenhum `docker/`, nenhum submodule ainda. Esta ADR e o
`integracao.md` que a acompanha são, portanto, um **padrão a seguir quando a implementação começar**,
não um checklist executável contra um sistema em produção (diferente do documento equivalente do
BioCultDB).

### Diferenças estruturais relevantes em relação às demais unidades

| Aspecto | Unidade Fontes Secundárias (BioCultDB) | Unidade Comunidade Tradicional (BioCultRelatos) | Unidade Acervos Históricos e Museológicos (BioCultAcervos) |
|---|---|---|---|
| Cardinalidade | Uma instância única, global | N instâncias, uma por comunidade tradicional membro | **N instâncias**, uma por acervo/museu/arquivo histórico membro, cada um soberano sobre seu próprio acervo digitalizado |
| Dados pré-existentes | Produção real e populada (`biocultdb.sqlite`) | Nenhum — cada comunidade parte de um arquivo novo | Nenhum — cada acervo parte de um arquivo novo |
| Ferramenta principal | BioCultDB (3 contextos, sem CLPI) | BioCultRelatos (Aquisição/Curadoria/Apresentação com CLPI obrigatório) | BioCultAcervos (registro de evidências em coleções, registros e documentos de museus/arquivos históricos, **sem CLPI direto**) |
| CLPI / C.A.R.E. | Não aplicável (fonte é literatura publicada) | CLPI obrigatório (registro direto com detentores vivos) | Sem CLPI da mesma forma (não é registro direto com detentores vivos) — mas os princípios **C.A.R.E.** seguem valendo integralmente, porque a evidência descreve conhecimento de uma comunidade tradicional específica, mesmo preservada por terceiros (museu/acervo) |
| Portas da ferramenta principal | 3001/3002/3003 (fixas, já em uso) | Ainda não definidas | Ainda não definidas (BioCultAcervos não tem código) |
| `AcquisitionService` do BioCultTermos | Já funciona hoje (schema `biocultdb_records` hardcoded) | Não funciona sem generalização | **Não funciona sem generalização** — schema de dados é outro (ver Decisão 6) |

## Decisão

Os princípios a seguir são **herdados diretamente** da integração BioCultDB/BioCultRelatos (mesma
arquitetura, ADR-005), sem adaptação:

1. **Um container por acervo, um arquivo SQLite compartilhado.** `SQLITE_DB_PATH` aponta para um único
   arquivo dentro do container do acervo; BioCultAcervos e BioCultTermos leem/escrevem tabelas
   distintas do mesmo arquivo, nunca uma tabela comum. Modo WAL (`journal_mode=WAL`, `foreign_keys=ON`,
   `busy_timeout=5000`).
2. **BioCultTermos como git submodule** em `BioCultAcervos/bioculttermos`, apontando para o mesmo
   `github.com/edalcin/BioCultTermos` já usado pelo BioCultDB e pelo BioCultRelatos — é o **mesmo
   código**, não um fork. Mesmo fluxo de desenvolvimento: alterações são commitadas a partir de
   `BioCultAcervos/bioculttermos/` e pushadas para o repositório remoto do submodule, seguidas de bump
   do ponteiro no repositório host (ver `BioCultDB/integracao.md` §7 para o passo a passo exato —
   idêntico aqui).
3. **Portas do BioCultTermos fixas em 4000 (público) / 4001 (admin)**, internas ao container — definidas
   pelo próprio código do BioCultTermos (`PUBLIC_PORT`/`ADMIN_PORT`, default 4000/4001), independem de
   qual ferramenta ele acompanha.
4. **Autenticação do BioCultTermos admin via `ADMIN_USERNAME` + `ADMIN_PASSWORD`** (mesmo padrão simples
   escolhido para o BioCultDB) — porém aqui, **cada acervo define suas próprias credenciais** no deploy
   da sua instância. Nunca reutilizar usuário/senha entre acervos diferentes.
5. **Uma imagem Docker única, dual-app, publicada por CI com submodule.** Mesmo padrão do
   `Dockerfile.unidade`/`start-unit.sh`/`docker-publish.yml` do BioCultDB: build multi-stage compilando
   BioCultAcervos + BioCultTermos, entrypoint que sobe os dois processos com fail-fast, CI com
   `actions/checkout` usando `submodules: recursive`. Imagem publicada como
   `ghcr.io/edalcin/bioculacervos:latest` (nome a confirmar quando o repositório de imagem for criado) —
   **uma imagem, reutilizada por todos os acervos**; o que é soberano é o **container e o volume de
   dados** de cada acervo, não o binário/imagem.

Os pontos a seguir **não** são herdados automaticamente — exigem decisão/trabalho próprio:

6. **`AcquisitionService` do BioCultTermos precisa ser generalizado antes de servir ao BioCultAcervos.**
   Hoje (`bioculttermos/backend/src/services/AcquisitionService.js:9-14,45-46`) ele lê a tabela
   `biocultdb_records` com uma lista fixa de campos (`comunidades.tipo`, `comunidades.plantas.nomeVernacular`,
   `comunidades.plantas.tipoUso`, `comunidades.atividadesEconomicas`) — específicos do schema do
   BioCultDB (`Reference` model). O schema de dados do BioCultAcervos (evidências de coleções, registros
   e documentos de museus/arquivos históricos) é outro; reutilizar o serviço como está não funciona.
   **Decisão**: generalizar o `AcquisitionService` para que o nome da tabela-fonte e a lista de campos
   monitorados sejam configuráveis (env var ou arquivo de config), não hardcoded — um único BioCultTermos
   serve qualquer tipo de unidade sem fork de código. Isso também exige generalizar os textos fixos da UI
   do BioCultTermos que hoje mencionam "BioCultDB" explicitamente (`admin/views/dashboard.ejs:80`,
   `admin/views/acquisition/logs.ejs:24`, `public/views/about.ejs:17,27,62,85-91`) para linguagem
   genérica ("a ferramenta principal desta unidade"). Este é trabalho de código no **repositório
   BioCultTermos** (compartilhado por todas as unidades), não específico do BioCultAcervos — pode (e
   idealmente deve) ser feito uma única vez, antes de qualquer unidade além do BioCultDB entrar em
   produção; é o mesmo bloqueio já registrado no ADR-001 do BioCultRelatos.
7. **Nome do arquivo SQLite**: como não há dado legado a preservar (diferente do BioCultDB, que ficou
   com `biocultdb.sqlite` por continuidade), cada nova instância de acervo **deve** usar o nome canônico
   da ADR-005: `SQLITE_DB_PATH=/data/unidade.sqlite`. A divergência do BioCultDB é uma exceção
   documentada, não o novo padrão — acervos novos partem limpos.
8. **Portas do próprio BioCultAcervos** (equivalente a 3001/3002/3003 do BioCultDB) ainda não estão
   definidas — dependem do desenho de produto do BioCultAcervos. Fora do escopo desta ADR, que trata
   apenas da integração com BioCultTermos. Quando o BioCultAcervos tiver seu primeiro esboço de
   contextos/portas, revisar esta ADR.
9. **Convenção de nome de container/deployment por acervo**: recomendado
   `bioculacervos-<slug-do-acervo>`, um container Docker por acervo/museu/arquivo histórico, cada um com
   seu próprio volume de dados — nunca um container multi-tenant compartilhando arquivo entre acervos
   diferentes (violaria soberania, princípio central da arquitetura federada).
10. **Ausência de CLPI direto não dispensa C.A.R.E.** Diferente do BioCultRelatos (onde há registro
    direto com detentores vivos e CLPI é obrigatório), o BioCultAcervos trabalha com evidências já
    preservadas em coleções/documentos de terceiros (museus, arquivos). Isso não reduz a exigência dos
    princípios C.A.R.E. (Collective Benefit, Authority to Control, Responsibility, Ethics): a autoridade
    sobre como o conhecimento tradicional descrito no acervo é registrado e compartilhado permanece com
    a comunidade a que ele se refere, mesmo que o processo de coleta de consentimento não seja o mesmo
    fluxo de CLPI em campo. Este ponto não gera trabalho técnico de integração com o BioCultTermos, mas
    condiciona o desenho futuro de curadoria do BioCultAcervos.

## Consequências

### Positivas

- Reaproveita 100% do scaffold Docker já validado no BioCultDB (Dockerfile multi-stage, entrypoint
  fail-fast, padrão de submodule) — nenhum desenho novo de infraestrutura necessário quando a
  implementação começar.
- Forçar a generalização do `AcquisitionService` agora (como decisão, mesmo sem implementar) evita que o
  BioCultDB grave ainda mais lógica hardcoded que precisaria ser desfeita depois — benefício já
  compartilhado com o BioCultRelatos, agora reforçado por um terceiro consumidor.
- Nomeação limpa (`unidade.sqlite`) desde o primeiro deploy evita a divergência doc-vs-produção que o
  BioCultDB carrega.
- Deixar explícito desde já que C.A.R.E. se aplica sem CLPI direto evita que a ausência de um checklist
  de campo (como no BioCultRelatos) seja mal-interpretada como dispensa de governança ética.

### Negativas

- `AcquisitionService` generalizado é trabalho real de código no repositório compartilhado
  `BioCultTermos`, não documentação — bloqueia o início da integração até ser feito.
  - *Mitigação*: pode ser feito independentemente do calendário desta unidade (é refactor do
    BioCultTermos), inclusive aproveitando o próximo ciclo de manutenção do BioCultDB.
- Multi-tenant real (N instâncias, N containers) introduz operação repetitiva (N credenciais, N
  volumes, N backups) que a unidade única do BioCultDB não tem.
  - *Mitigação*: fora de escopo desta ADR; tratar como próximo ADR quando o número de instâncias
    justificar automação (ex.: template de container Unraid, script de provisionamento).

## Referências

- `Arquitetura-BioCultural/docs/architecture-decisions/ADR-004-federated-architecture.md`
- `Arquitetura-BioCultural/docs/architecture-decisions/ADR-005-sqlite-json-persistence.md`
- `BioCultDB/integracao.md` e `BioCultDB/docs/decisions/ADR-001-integracao-bioculttermos.md` (modelo de
  implementação real, referência primária desta ADR)
- `BioCultRelatos/integracao.md` e `BioCultRelatos/docs/decisions/ADR-001-integracao-bioculttermos.md`
  (mesmo padrão aplicado à unidade Comunidade Tradicional)
- `BioCultAcervos/integracao.md` (checklist/padrão detalhado desta decisão)
- `BioCultDB/bioculttermos/backend/src/services/AcquisitionService.js` (ponto de generalização necessário)

## Data de Revisão

Revisitar assim que (a) o `AcquisitionService` for generalizado no repositório BioCultTermos, e/ou (b)
esta unidade tiver seu primeiro esboço de contextos/portas próprios.
