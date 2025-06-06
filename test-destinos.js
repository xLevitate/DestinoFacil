// Defina as variáveis de ambiente necessárias antes de importar os módulos
process.env.NEXT_PUBLIC_PEXELS_API_KEY = ''; // Deixe em branco se não for usar

const { servicoApiDestinos } = require('./src/servicos/apiDestinos');
const { servicoDadosLocais } = require('./src/servicos/dadosLocais');

// Função de utilidade para imprimir resultados de forma clara
const printResultado = (titulo, resultado) => {
  console.log(`\n--- ${titulo} ---`);
  if (!resultado || resultado.dados.length === 0) {
    console.log('Nenhum resultado encontrado.');
    return;
  }
  console.log(`Total de Itens: ${resultado.totalItens}, Total de Páginas: ${resultado.totalPaginas}, Página Atual: ${resultado.paginaAtual}`);
  console.log('Destinos na página:');
  resultado.dados.forEach(d => {
    console.log(`- ${d.nome}, ${d.pais} (Pop: ${d.populacao}, Preço: ${d.preco}, Clima: ${d.clima})`);
  });
  console.log('--- Fim ---\n');
};

// Função de teste principal
const rodarTestes = async () => {
  console.log('Iniciando testes da API de Destinos...');

  try {
    // Inicializar dados locais (importante para o servidor)
    await servicoDadosLocais.carregarDados();
    console.log('Dados locais carregados com sucesso.');

    // Teste 1: Obter a primeira página de destinos sem filtros
    const resultadoPagina1 = await servicoApiDestinos.obterDestinosPaginados({
      pagina: 1,
      limite: 12,
    });
    printResultado('Teste 1: Primeira Página (12 destinos)', resultadoPagina1);
    if (!resultadoPagina1 || resultadoPagina1.totalItens < 100) {
        throw new Error(`FALHA NO TESTE 1: Esperado mais de 100 destinos totais, mas foram encontrados ${resultadoPagina1.totalItens}.`);
    }

    // Teste 2: Obter a segunda página
    const resultadoPagina2 = await servicoApiDestinos.obterDestinosPaginados({
      pagina: 2,
      limite: 12,
    });
    printResultado('Teste 2: Segunda Página', resultadoPagina2);

    // Teste 3: Buscar por um termo específico (ex: "são paulo")
    const resultadoBusca = await servicoApiDestinos.obterDestinosPaginados({
      pagina: 1,
      limite: 12,
      termoBusca: 'são paulo',
    });
    printResultado('Teste 3: Busca por "são paulo"', resultadoBusca);

    // Teste 4: Filtrar por preço "alto" e clima "quente"
    const resultadoFiltro = await servicoApiDestinos.obterDestinosPaginados({
      pagina: 1,
      limite: 12,
      filtros: {
        preco: 'alto',
        clima: 'quente',
      },
    });
    printResultado('Teste 4: Filtro (Preço: Alto, Clima: Quente)', resultadoFiltro);

    // Teste 5: Ordenar por população
    const resultadoOrdenacao = await servicoApiDestinos.obterDestinosPaginados({
        pagina: 1,
        limite: 12,
        filtros: {
          ordenarPor: 'populacao',
        },
      });
      printResultado('Teste 5: Ordenado por População (descendente)', resultadoOrdenacao);
      if (resultadoOrdenacao.dados.length > 1 && resultadoOrdenacao.dados[0].populacao < resultadoOrdenacao.dados[1].populacao) {
          throw new Error('FALHA NO TESTE 5: A ordenação por população não está funcionando corretamente.');
      }

    console.log('✅ Todos os testes foram concluídos com sucesso!');

  } catch (error) {
    console.error('\n❌ Um erro ocorreu durante os testes:', error);
  }
};

// Executar os testes
rodarTestes(); 