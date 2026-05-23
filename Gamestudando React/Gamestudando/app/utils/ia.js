export function escolherProximaAtividade(perfil) {

  if (!perfil) return { materia: "portugues" };

  const mat = perfil.matematica || { acertos: 0, erros: 0, ultimaPontuacao: 0.5 };
  const port = perfil.portugues || { acertos: 0, erros: 0, ultimaPontuacao: 0.5 };
  const rimas = perfil.rimas || { acertos: 0, erros: 0, ultimaPontuacao: 0.5 };

  const pesoMat = calcularPeso(mat);
  const pesoPort = calcularPeso(port);
  const pesoRimas = calcularPeso(rimas);

  const soma = pesoMat + pesoPort + pesoRimas;

  const rand = Math.random() * soma;

  if (rand < pesoMat) return { materia: "matematica" };
  if (rand < pesoMat + pesoPort) return { materia: "portugues" };
  return { materia: "rimas" };
}

function calcularPeso(dados) {
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
