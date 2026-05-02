export function escolherProximaAtividade(dados) {
  let piorArea = null;
  let piorPrecisao = 1;

  for (let area in dados) {
    const total = dados[area].acertos + dados[area].erros;

    if (total === 0) continue;

    const precisao = dados[area].acertos / total;

    if (precisao < piorPrecisao) {
      piorPrecisao = precisao;
      piorArea = area;
    }
  }

  if (piorPrecisao >= 0.7) {
    return "proxima_fase_normal";
  }

  return piorArea;
}