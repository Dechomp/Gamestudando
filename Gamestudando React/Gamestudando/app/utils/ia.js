export function escolherProximaAtividade(perfil, materiasPermitidas = null) {
  // Calcula a proxima materia com base nos erros, acertos e ultima pontuacao.

  if (!perfil) return { materia: "portugues" };

  const mat = perfil.matematica || { acertos: 0, erros: 0, ultimaPontuacao: 0.5 };
  const port = perfil.portugues || { acertos: 0, erros: 0, ultimaPontuacao: 0.5 };
  const rimas = perfil.rimas || { acertos: 0, erros: 0, ultimaPontuacao: 0.5 };

  const pesoMat = calcularPeso(mat);
  const pesoPort = calcularPeso(port);
  const pesoRimas = calcularPeso(rimas);
  const pesoCosmoletrando = pesoPort * 0.65;

  // Sorteio ponderado: materias com mais dificuldade aparecem mais, mas nao sempre.
  const pesosPorMateria = {
    matematica: pesoMat,
    portugues: pesoPort,
    rimas: pesoRimas,
    cosmoletrando: pesoCosmoletrando,
  };
  const materias = (materiasPermitidas || Object.keys(pesosPorMateria))
    .filter((materia) => pesosPorMateria[materia] != null);
  const soma = materias.reduce((total, materia) => total + pesosPorMateria[materia], 0);

  const rand = Math.random() * soma;
  let acumulado = 0;
  for (const materia of materias) {
    acumulado += pesosPorMateria[materia];
    if (rand < acumulado) return { materia };
  }
  return { materia: materias[0] || "portugues" };
}

function calcularPeso(dados) {
  // Quanto menor o desempenho, maior o peso daquela materia.
  const total = dados.acertos + dados.erros;
  const taxaGeral = total > 0 ? dados.acertos / total : 0.5;
  const ultimaPontuacao =
    typeof dados.ultimaPontuacao === "number"
      ? dados.ultimaPontuacao
      : taxaGeral;

  const dificuldadeGeral = 1 - taxaGeral;
  const dificuldadeRecente = 1 - ultimaPontuacao;

  const pesoBase = 0.6;
  const pesoDificuldadeGeral = dificuldadeGeral * 0.7;
  const pesoDificuldadeRecente = dificuldadeRecente * 0.7;

  return pesoBase + pesoDificuldadeGeral + pesoDificuldadeRecente;
}
