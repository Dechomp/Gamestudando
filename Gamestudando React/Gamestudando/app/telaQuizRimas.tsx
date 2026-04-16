import { Text, View, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { styles } from "./styles";
import { palavrasEsquerda, palavrasDireita } from "./perguntasQuizRimas";

export default function Index() {

  // =========================
  // 🔁 GERAR RODADA (SEM REPETIÇÃO)
  // =========================
  const gerarRodada = () => {

    const palavrasUsadas = [];

    const esquerdaEscolhida = [];
    const direitaEscolhida = [];

    while (esquerdaEscolhida.length < 5) {

      const esq = palavrasEsquerda[
        Math.floor(Math.random() * palavrasEsquerda.length)
      ];

      // evita repetir palavra
      if (palavrasUsadas.includes(esq.texto)) continue;

      let opcoes = palavrasDireita.filter(d =>
        d.par === esq.par &&
        d.texto !== esq.texto &&
        !palavrasUsadas.includes(d.texto)
      );

      if (opcoes.length === 0) continue;

      const dir = opcoes[Math.floor(Math.random() * opcoes.length)];

      esquerdaEscolhida.push(esq);
      direitaEscolhida.push(dir);

      palavrasUsadas.push(esq.texto);
      palavrasUsadas.push(dir.texto);
    }

    direitaEscolhida.sort(() => Math.random() - 0.5);

    return {
      esquerda: esquerdaEscolhida,
      direita: direitaEscolhida
    };
  };

  // =========================
  // 🎯 ESTADOS
  // =========================

  const [rodada, setRodada] = useState(gerarRodada());

  const [selecionadoEsquerda, setSelecionadoEsquerda] = useState(null);
  const [selecionadoDireita, setSelecionadoDireita] = useState(null);

  const [acertos, setAcertos] = useState([]); // grupos (rimas)
  const [bloqueados, setBloqueados] = useState([]); // IDs travados

  const [erro, setErro] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);

  const progresso = acertos.length / 5;

  // =========================
  // 🖱️ SELEÇÃO
  // =========================

  const selecionarEsquerda = (item) => {

    if (bloqueado) return;

    if (bloqueados.includes(item.id)) return;

    if (selecionadoEsquerda?.id === item.id) {
      setSelecionadoEsquerda(null);
    } else {
      setSelecionadoEsquerda(item);
    }
  };

  const selecionarDireita = (item) => {

    if (bloqueado) return;

    if (bloqueados.includes(item.id)) return;

    if (selecionadoDireita?.id === item.id) {
      setSelecionadoDireita(null);
    } else {
      setSelecionadoDireita(item);
    }
  };

  // =========================
  // 🧠 VERIFICAÇÃO
  // =========================

  const verificar = () => {

    if (!selecionadoEsquerda || !selecionadoDireita || bloqueado) return;

    setBloqueado(true);

    // ✅ valida por rima
    if (selecionadoEsquerda.grupo === selecionadoDireita.grupo) {

      setBloqueados((prev) => [
        ...prev,
        selecionadoEsquerda.id,
        selecionadoDireita.id
      ]);

      setAcertos((prev) => [...prev, selecionadoEsquerda.grupo]);

      setSelecionadoEsquerda(null);
      setSelecionadoDireita(null);
      setBloqueado(false);
    }

    // ❌ erro
    else {
      setErro(true);

      setTimeout(() => {
        setErro(false);
        setSelecionadoEsquerda(null);
        setSelecionadoDireita(null);
        setBloqueado(false);
      }, 800);
    }
  };

  // executa automático
  useEffect(() => {
    if (selecionadoEsquerda && selecionadoDireita) {
      const timer = setTimeout(verificar, 200);
      return () => clearTimeout(timer);
    }
  }, [selecionadoEsquerda, selecionadoDireita]);

  // =========================
  // 🎨 ESTILOS
  // =========================

  const estiloEsquerda = (item) => {

    if (bloqueados.includes(item.id)) return styles.itemDesativado;

    if (selecionadoEsquerda?.id === item.id)
      return erro ? styles.itemErro : styles.itemSelecionado;

    return styles.itemNormal;
  };

  const estiloDireita = (item) => {

    if (bloqueados.includes(item.id)) return styles.itemDesativado;

    if (selecionadoDireita?.id === item.id)
      return erro ? styles.itemErro : styles.itemSelecionado;

    return styles.itemNormal;
  };

  // =========================
  // 🔄 NOVA RODADA
  // =========================

  useEffect(() => {
    if (acertos.length === 5) {

      setTimeout(() => {
        setRodada(gerarRodada());
        setAcertos([]);
        setBloqueados([]);
        setSelecionadoEsquerda(null);
        setSelecionadoDireita(null);
      }, 1000);

    }
  }, [acertos]);

  // =========================
  // 🖥️ RENDER
  // =========================

  return (
    <View style={styles.container}>

      <Text style={styles.textoPergunta}>
        Conecte as rimas
      </Text>

      <Text style={{ marginTop: 5 }}>
        {acertos.length} / 5
      </Text>

      {/* 📊 Barra */}
      <View style={styles.barraContainer}>
        <View
          style={[
            styles.barraProgresso,
            { width: `${progresso * 100}%` }
          ]}
        />
      </View>

      <View style={{ flexDirection: "row", marginTop: 20 }}>

        {/* ESQUERDA */}
        <View style={{ flex: 1 }}>
          {rodada.esquerda.map((item) => (
            <View key={item.id} style={estiloEsquerda(item)}>
              <TouchableOpacity onPress={() => selecionarEsquerda(item)}>
                <Text style={styles.texto}>{item.texto}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* DIREITA */}
        <View style={{ flex: 1 }}>
          {rodada.direita.map((item) => (
            <View key={item.id} style={estiloDireita(item)}>
              <TouchableOpacity onPress={() => selecionarDireita(item)}>
                <Text style={styles.texto}>{item.texto}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </View>

      {/* FINAL */}
      {acertos.length === 5 && (
        <Text style={{ marginTop: 20, fontSize: 20 }}>
          Parabéns! 🎉
        </Text>
      )}

    </View>
  );
}