# Próximos Passos — BioCultAcervos

> **Documento de estado desta unidade.** Registra onde o BioCultAcervos está e o que falta fazer. Ponto de entrada de qualquer nova sessão de trabalho — humana ou assistida por IA.
>
> Pendência de arquitetura da federação **não** mora aqui: mora em [`Arquitetura-BioCultural/docs/tecnico/proximosPassos.md`](https://github.com/edalcin/Arquitetura-BioCultural/blob/main/docs/tecnico/proximosPassos.md), que é a referência única do projeto. Aqui ficam só as pendências desta unidade.
>
> **Regras de manutenção:** ao final de cada sessão, atualizar a data, o estado e a lista de pendências. Pendência resolvida não é apagada: é marcada como feita, com o `onde`. Caminhos são relativos à raiz deste repositório.

**Estado em:** 2026-08-30

---

## 1. Estado

**Fase inicial: repositório, documentação e home page.** Existem README, ADR-001 (integração BioCultTermos, *Aceito*), `integracao.md` e o submodule BioCultTermos adicionado. O `backend/src/server.js` é um Express minimal (~47 linhas) na porta 3003 (Apresentação), que serve a home page com EJS e responde 404 explícito às rotas não implementadas. Nenhuma persistência.

É a unidade de **acervos museológicos e históricos**: guarda evidência física custodiada por instituições — matérias-primas e artefatos vegetais, exsicatas, peças de coleções etnológicas. Registro sempre de regime `evidencia`. A narrativa de uma comunidade sobre uma peça **não** vive aqui: vive no BioCultRelatos da própria comunidade, referenciando o item.

Estudo de caso: **Coleção Etnobotânica do JBRJ (RBetno)**, no *Index Herbariorum* desde 2012, catalogada no Jabot, com digitalização 2D descrita em Fonseca-Kruel et al. (2026).

## 2. Pendências

| # | Pendência | Origem / bloqueio |
|---|---|---|
| 1 | **Generalizar o `AcquisitionService`** do BioCultTermos para aceitar lista de pares `{tabela, campos[]}` | ADR-001, Decisão 6 — **bloqueante** de tudo; o código vive no BioCultDB |
| 2 | **Persistência SQLite+JSON1** e modelo de dados do acervo (objeto, matéria-prima, artefato, procedência, vínculo com exsicata) | Nada existe além da home page |
| 3 | **Contextos de Registro e Curadoria** — hoje só existe Apresentação, e vazia | Depende de 1 e 2 |
| 4 | **`relatedResources`**: expressar que um objeto de acervo é referenciado por um Relato de outro membro da federação | Contrato de harvest (ADR-016 H3): `refers to`, `same as`, `derived from` |
| 5 | **Endpoint de harvest** paginado, com redação na fronteira | Contrato de harvest da arquitetura |
| 6 | **Scaffold de empacotamento**: `docker/Dockerfile.unidade` dual-app, `start-unit.sh`, CI com submodule recursivo publicando em `ghcr.io/edalcin/biocultacervos`; definição final de portas | `integracao.md` (portas 4000/4001 para o BioCultTermos, ainda inativas) |

## 3. Onde está cada coisa

| Artefato | Caminho |
|---|---|
| Checklist de integração BioCultTermos (oito passos) | `integracao.md` |
| Decisões desta unidade | `docs/decisions/` |
| Artigo sobre a digitalização da coleção | `docs/Plants People Planet - 2025 - Fonseca-Kruel ... .pdf` |
| Referência única do projeto | <https://github.com/edalcin/Arquitetura-BioCultural/blob/main/docs/tecnico/proximosPassos.md> |
