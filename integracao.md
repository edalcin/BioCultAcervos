# Integração BioCultTermos → BioCultAcervos (unidade Acervos Históricos e Museológicos)

> Documento de referência para o agente de IA (Claude) que implementará esta integração **quando o
> BioCultAcervos tiver código**. Produzido em sessão de `grill-with-docs` em 2026-07-12, na mesma sessão
> em que a integração equivalente foi planejada para o BioCultDB e para o BioCultRelatos.
>
> **Leia primeiro**: `BioCultDB/integracao.md` e `BioCultDB/docs/decisions/ADR-001-integracao-bioculttermos.md`
> — é o modelo de implementação real (scaffold Docker já construído e testado) do qual este documento
> deriva. Veja também `BioCultRelatos/integracao.md`, mesma adaptação para outro tipo de membro. Este
> documento assume que você já leu esses e foca só nas **diferenças**.
>
> Decisão operacional desta integração: `BioCultAcervos/docs/decisions/ADR-001-integracao-bioculttermos.md`
> (leia antes deste checklist).

## 0. Por que este documento é diferente do equivalente do BioCultDB

O documento do BioCultDB descreve um **corte em produção**: container `etnoDB` já rodando, dados reais,
imagem já publicada. Este documento descreve um **padrão a aplicar quando o BioCultAcervos for
implementado do zero** — hoje o repositório só tem `README.md` e `LICENSE`, nenhum `backend/`, nenhum
`docker/`. Trate as seções abaixo como especificação de arquitetura de deploy, não como checklist contra
um sistema existente.

Diferença estrutural mais importante: BioCultDB é **uma instância única e global**. BioCultAcervos é
**um padrão replicado N vezes** — uma instância inteiramente separada e soberana por acervo, museu ou
arquivo histórico membro da federação. Tudo abaixo descreve o padrão de UMA instância (um acervo); ele
se repete, sem compartilhar nada (nem imagem de dados, nem credenciais, nem arquivo SQLite), para cada
novo acervo que entra na federação.

## 1. O que herda diretamente do padrão BioCultDB (sem adaptação)

Estes princípios são a mesma decisão arquitetural (ADR-005), aplicados de novo:

- **Um container por unidade (por acervo), um único arquivo SQLite compartilhado** entre BioCultAcervos
  e BioCultTermos, tabelas distintas, nunca uma tabela comum. `SQLITE_DB_PATH` aponta pra ele. Modo WAL
  (`journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000`).
- **BioCultTermos como git submodule** em `BioCultAcervos/bioculttermos`, apontando para
  `github.com/edalcin/BioCultTermos` — o **mesmo** repositório/código usado pelo BioCultDB e pelo
  BioCultRelatos, não um fork. Fluxo de desenvolvimento idêntico ao documentado em
  `BioCultDB/integracao.md` §7: editar dentro de `BioCultAcervos/bioculttermos/`, commit + push para o
  remoto do submodule, depois bump do ponteiro + commit no repositório host (`BioCultAcervos`).
- **Portas do BioCultTermos fixas: 4000 (público, sem auth) / 4001 (admin, HTTP Basic + bcrypt)** —
  definidas pelo próprio código do submodule (`PUBLIC_PORT`/`ADMIN_PORT`, default 4000/4001;
  `bioculttermos/backend/src/config/index.js:34-35`), independem da ferramenta parceira.
- **Autenticação do BioCultTermos admin via `ADMIN_USERNAME` + `ADMIN_PASSWORD`** (texto plano, hash
  bcrypt gerado no boot — mesma Opção B de `config/index.js:22-28`). **Diferente do BioCultDB**: aqui
  cada instância escolhe suas próprias credenciais no momento do deploy — nunca reaproveitar
  usuário/senha de outra instância.
- **Imagem Docker única dual-app**, construída por um `Dockerfile.unidade`-equivalente (multi-stage:
  builder compila a ferramenta principal + BioCultTermos submodule; runtime `node:20-alpine`, non-root
  uid 1001, `dumb-init` como PID 1) e um `start-unit.sh`-equivalente (sobe os dois processos como filhos,
  forwarda `SIGTERM`, fail-fast se um crashar sozinho) — copiar a estrutura de
  `BioCultDB/docker/Dockerfile.unidade` e `docker/start-unit.sh` quase literalmente.
- **CI publica uma imagem única com submodule**: workflow `.github/workflows/docker-publish.yml`
  (a criar) com `actions/checkout@v4` + `submodules: recursive`. Uma imagem **reutilizada por todas as
  instâncias** — o que é soberano é o container + volume de cada deploy, não o binário.
- **Operação de corte (updates futuros)**: mesmo checklist do BioCultDB (`integracao.md` §4.2) por
  instância — backup do arquivo SQLite, registrar digest da imagem atual antes de atualizar (`:latest` é
  tag flutuante), substituição in-place do container, verificação de saúde, rollback pelo digest se
  necessário.

## 2. O que NÃO herda — decisões e trabalho específicos desta unidade

### 2.1 `AcquisitionService` precisa ser generalizado primeiro (bloqueante)

O `AcquisitionService` do BioCultTermos hoje só sabe ler a tabela `biocultdb_records` com uma lista fixa
de campos do schema `Reference` do BioCultDB — **reutilizar o serviço como está não funciona**. Decisão
tomada (ver ADR-001 §6): generalizar o serviço no repositório BioCultTermos para que o nome da
tabela-fonte e a lista de campos monitorados sejam configuráveis, e os textos fixos da UI virem
genéricos. Trabalho de código no repositório **BioCultTermos** (compartilhado por todas as unidades),
não específico desta unidade — o mesmo bloqueio já registrado para o BioCultRelatos.

### 2.2 Nome do arquivo SQLite

`SQLITE_DB_PATH=/data/unidade.sqlite` desde o primeiro deploy (nome canônico da ADR-005) — sem dado
legado a preservar, ao contrário do BioCultDB.

### 2.3 Portas da ferramenta principal desta unidade — ainda não definidas

Fora do escopo deste documento (que trata só da integração com BioCultTermos). Quando o primeiro esboço
de contextos/portas existir, atualizar este documento e a ADR-001 com os números reais — o único ponto
fixo hoje é que **BioCultTermos usa 4000/4001 internamente, sempre**.

### 2.4 Multi-tenant: convenção de deployment por instância

Cada instância soberana = um container inteiramente separado, nunca compartilhando arquivo, credenciais
ou volume com outra. Convenção recomendada: nome do container `bioculacervos-<slug-do-acervo>`, um
volume de dados por instância, credenciais admin exclusivas, backup independente (cobre a ferramenta
principal + BioCultTermos daquela instância, mesmo arquivo).

Não existe automação de provisionamento multi-instância hoje — cada instância é criada manualmente
seguindo este documento até que o número de instâncias justifique automatizar (próxima ADR, não esta).

### 2.5 Ausência de CLPI direto — C.A.R.E. permanece obrigatório

Diferente do BioCultRelatos, o BioCultAcervos não faz registro direto com detentores vivos e portanto
não tem um fluxo de CLPI (Consentimento Livre, Prévio e Informado) obrigatório em campo. Isso **não**
dispensa os princípios C.A.R.E. (Collective Benefit, Authority to Control, Responsibility, Ethics): a
evidência preservada no acervo/museu ainda descreve conhecimento tradicional de uma comunidade
específica, e a autoridade sobre como esse conhecimento é registrado e compartilhado permanece com a
comunidade a que ele se refere (ver `BioCultAcervos/README.md`). Este ponto não gera trabalho técnico de
integração com o BioCultTermos (não há um `flag` ou tabela de CLPI a espelhar), mas deve condicionar o
desenho futuro de curadoria da ferramenta principal.

### 2.6 Endpoint de federação — não é escopo deste documento

`GET /api/federation/records` (ADR-004 D6) é responsabilidade da ferramenta principal desta unidade, não
do BioCultTermos nem desta integração — a integração aqui documentada é estritamente sobre BioCultTermos
compartilhar o arquivo SQLite e prover vocabulário controlado.

## 3. Checklist de implementação (quando o código começar a existir)

1. Confirmar que o `AcquisitionService` do BioCultTermos já foi generalizado (§2.1) — se não, esse é o
   primeiro passo, no repositório BioCultTermos, antes de tocar nesta unidade.
2. ~~Adicionar `bioculttermos` como git submodule na raiz deste repositório~~ — **feito**
   (2026-08-09), pinado em `f44e72d`. Comando usado, com o `-b main` que o ADR-012 G3 exige:
   `git submodule add -b main https://github.com/edalcin/BioCultTermos.git bioculttermos`.
   Sem `branch = main` no `.gitmodules`, `git submodule update --remote` não tem alvo declarado.
   Enquanto esta unidade não tiver `docker/Dockerfile.unidade`, o bump aqui é escrituração e não
   adoção verificada — não há como buildar nem exercitar o módulo (ADR-010 G3).
3. Criar `docker/Dockerfile.unidade` e `docker/start-unit.sh` espelhando os do BioCultDB.
4. Definir e documentar as portas da ferramenta principal (§2.3) antes de finalizar o
   Dockerfile/entrypoint.
5. Criar `.github/workflows/docker-publish.yml` com `submodules: recursive` e build de
   `docker/Dockerfile.unidade`.
6. Para o primeiro deploy de cada instância: `SQLITE_DB_PATH=/data/unidade.sqlite` (arquivo novo, vazio),
   `ADMIN_USERNAME`/`ADMIN_PASSWORD` próprios, volume de dados dedicado, nome de container seguindo a
   convenção §2.4.
7. Verificar saúde nas mesmas linhas do checklist do BioCultDB (`BioCultDB/integracao.md` §5), adaptando
   as portas para as definidas no passo 4.
8. Disparar a primeira aquisição manualmente (`POST /acquisition/run` autenticado) assim que a instância
   já tiver alguns registros — mesma lógica do BioCultDB: o vocabulário candidato nasce da varredura dos
   dados já existentes, não precisa esperar o cron.

## 4. Fora de escopo

- Implementação de código desta unidade em si (registro de evidências, curadoria, apresentação) — este
  documento cobre só a integração com BioCultTermos.
- Endpoint `/api/federation/records` e integração com Pluriverso (§2.6) — decisão/documento separado.
- Desenho do fluxo de governança C.A.R.E. sem CLPI direto (§2.5) — decisão de produto do BioCultAcervos,
  não desta integração.
- Automação de provisionamento multi-instância (§2.4) — próxima ADR quando o volume justificar.

## 5. Glossário

Ver `BioCultDB/integracao.md` §10 para o glossário completo dos termos técnicos compartilhados (Unidade
Federada, `SQLITE_DB_PATH`, WAL, JSON1, FTS5, SKOS-XL, `AcquisitionService`, `candidate`/`active`/`deprecated`,
HTTP Basic Auth, `start-unit.sh`, `dumb-init`, submodule, corte/cutover) — todos se aplicam aqui
identicamente. Termo adicional específico desta unidade:

- **Acervo Histórico/Museológico**: instituição (museu, arquivo, coleção) que preserva documentos,
  registros e coleções com evidências de conhecimento tradicional associado à biodiversidade; cada
  acervo membro da federação é uma unidade soberana própria, com seu próprio container, arquivo SQLite e
  instância do BioCultTermos.
