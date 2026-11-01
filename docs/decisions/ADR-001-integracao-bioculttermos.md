# ADR-001: Relação do BioCultAcervos com o BioCultTermos

## Status

**Aceito** como padrão de arquitetura; sem implementação. Revisado em Novembro 2026 (remoção do esqueleto de código; o repositório passou a ser só proposta).

## Contexto

A arquitetura federada ([ADR-004](https://github.com/edalcin/Arquitetura-BioCultural/blob/main/docs/tecnico/architecture-decisions/ADR-004-federated-architecture.md), [ADR-005](https://github.com/edalcin/Arquitetura-BioCultural/blob/main/docs/tecnico/architecture-decisions/ADR-005-sqlite-json-persistence.md), [ADR-007](https://github.com/edalcin/Arquitetura-BioCultural/blob/main/docs/tecnico/architecture-decisions/ADR-007-shared-bioculttermos-module.md), [ADR-012](https://github.com/edalcin/Arquitetura-BioCultural/blob/main/docs/tecnico/architecture-decisions/ADR-012-manutencao-codigo-bioculttermos.md)) define que toda unidade federada tem vocabulário soberano gerido pelo BioCultTermos. Este ADR registra o que isso significa para a unidade de acervos, sem escolher tecnologia.

## Decisão

1. **Uma unidade por acervo.** Cada museu, arquivo ou coleção membro é uma unidade inteiramente separada e soberana: dados, vocabulário e credenciais próprios, nunca compartilhados com outro acervo.
2. **Vocabulário soberano via BioCultTermos.** O BioCultTermos é o mesmo módulo compartilhado das demais unidades, não um fork. A camada semântica de cada acervo é própria; o Pluriverso a unifica com as demais por mapeamentos SKOS-XL.
3. **Campos monitorados específicos.** O que o BioCultTermos observa para sugerir termos candidatos depende do esquema de evidências do acervo (objeto, matéria-prima, artefato, procedência). A generalização desse mecanismo é trabalho do BioCultTermos, comum a todas as unidades.
4. **Nomenclatura científica fora do vocabulário controlado** (ADR-014): segue como dado de primeira classe do registro, não do vocabulário.
5. **Sem CLPI direto, com C.A.R.E. integral.** Não há registro com detentores vivos, mas a autoridade sobre o conhecimento descrito permanece com a comunidade de origem e condiciona o desenho da curadoria.
6. **Harvest.** A unidade expõe seus registros ao Pluriverso pelo contrato de harvest (ADR-016).

## Consequências

- A decisão vale para qualquer pilha futura; escolhas de implementação ficam com quem assumir a proposta.
- Operar N unidades independentes implica N conjuntos de dados e credenciais; automatizar isso seria decisão futura.

## Referências

- [Arquitetura BioCultural](https://github.com/edalcin/Arquitetura-BioCultural) (ADRs 004, 005, 007, 012, 014, 015, 016)
