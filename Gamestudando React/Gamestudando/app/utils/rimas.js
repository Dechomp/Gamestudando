export function parecemRimar(palavraA, palavraB) {
  // Compara o final sonoro das palavras para validar pares de rima.
  const a = normalizarPalavra(palavraA);
  const b = normalizarPalavra(palavraB);

  if (a.length < 2 || b.length < 2 || a === b) return false;

  const finalA = obterFinalRima(a);
  const finalB = obterFinalRima(b);

  return finalA === finalB || a.slice(-3) === b.slice(-3);
}

export function normalizarPalavra(texto) {
  // Remove acentos e simbolos antes de comparar palavras.
  return String(texto)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function obterFinalRima(palavra) {
  // Usa a ultima vogal relevante para tentar achar o trecho que rima.
  const finalComTres = palavra.slice(-3);
  const indiceVogal = finalComTres.search(/[aeiou]/);

  if (indiceVogal >= 0) {
    const final = finalComTres.slice(indiceVogal);
    return final.length >= 2 ? final : palavra.slice(-2);
  }

  return palavra.slice(-2);
}
