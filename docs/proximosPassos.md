# Próximos Passos — BioCultAcervos

**Estado em:** 2026-11-01

## Estado

**Proposta, sem implementação; aberta a quem quiser assumir.** O repositório tem só documentação. O esqueleto de código anterior e o submódulo BioCultTermos foram removidos; a relação com o BioCultTermos está descrita no [ADR-001](decisions/ADR-001-integracao-bioculttermos.md).

Estudo de caso de referência: **Coleção Etnobotânica do JBRJ (RBetno)**, no *Index Herbariorum* desde 2012, catalogada no Jabot, com digitalização 2D descrita em Fonseca-Kruel et al. (2026) — PDF local em `docs/`, não versionado.

## Pendências (nível de arquitetura)

| # | Pendência | Origem |
|---|---|---|
| 1 | Modelo de dados do acervo: objeto, matéria-prima, artefato, procedência, vínculo com exsicata | Quem assumir |
| 2 | Curadoria sob C.A.R.E. sem CLPI direto, com Notices | Proposta de governança |
| 3 | `relatedResources`: objeto de acervo referenciado por Relato de outro membro (`refers to`, `same as`, `derived from`) | ADR-016 |
| 4 | Harvest para o Pluriverso, com redação na fronteira | ADR-016 |
| 5 | Campos monitorados pelo BioCultTermos para esta unidade | ADR-001 |

Pendências da federação ficam em [`Arquitetura-BioCultural/docs/tecnico/proximosPassos.md`](https://github.com/edalcin/Arquitetura-BioCultural/blob/main/docs/tecnico/proximosPassos.md).
