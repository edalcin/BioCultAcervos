/**
 * BioCultAcervos — Unidade de Acervos Históricos e Museológicos.
 *
 * Contexto de Apresentação (porta 3003), seguindo a convenção de portas já usada
 * pelo BioCultDB, pelo BioCultNaturalistas e pelo BioCultRelatos: 3001 Registro,
 * 3002 Curadoria, 3003 Apresentação. A porta é provisória enquanto o desenho de
 * produto não fixa os contextos desta unidade (integracao.md §2.3) — hoje o
 * único contexto que existe é esta própria Apresentação (a home page).
 *
 * Hoje serve só a home page. Não há banco: o SQLite da unidade entra quando o
 * primeiro contexto com dados existir (ADR-005 — um arquivo por unidade,
 * compartilhado com o BioCultTermos).
 */

const path = require('path');
const express = require('express');

const PORT = Number(process.env.PRESENTATION_PORT) || 3003;
const rootDir = path.resolve(__dirname, '../..');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'contexts/presentation/views'));

app.use('/styles', express.static(path.join(rootDir, 'frontend/dist/styles')));

app.get('/', (req, res) => {
  res.render('index', {
    pageTitle: 'Início',
    contextName: 'BioCultAcervos',
    contextDescription: 'Registro de evidências de conhecimento tradicional associado à biodiversidade preservadas em acervos históricos e museológicos'
  });
});

// A unidade sobe mesmo incompleta, mas nunca finge: qualquer rota ainda não
// implementada responde 404 explícito em vez de uma tela vazia.
app.use((req, res) => {
  res.status(404).send('Não encontrado. O BioCultAcervos ainda só implementa a home page.');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[bioculacervos] Apresentação em http://localhost:${PORT}`);
  });
}

module.exports = app;
