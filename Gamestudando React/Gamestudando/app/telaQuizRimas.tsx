import { useRouter, useLocalSearchParams } from "expo-router";
import { Text, View, TouchableOpacity, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { styles } from "./styles";
import { palavrasEsquerda, palavrasDireita } from "./perguntasQuizRimas";

export default function Index() {

  const router = useRouter();
  const params = useLocalSearchParams();

  // 🎬 FADE
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // =========================
  // 🔁 GERAR RODADA
  // =========================

  const gerarRodada = () => {

    const palavrasUsadas = [];
    const esquerdaEscolhida = [];
    const direitaEscolhida = [];

    while (esquerdaEscolhida.length < 5) {

      const esq = palavrasEsquerda[
        Math.floor(Math.random() * palavrasEsquerda.length)
      ];

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

  const [acertos, setAcertos] = useState([]);
  const [bloqueados, setBloqueados] = useState([]);

  const [erro, setErro] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);

  const progresso = acertos.length / 5;

  // =========================
  // 🎬 FADE IN
  // =========================

  useEffect(() => {
    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // =========================
  // 🖱️ SELEÇÃO
  // =========================

  const selecionarEsquerda = (item) => {

    if (bloqueado) return;
    if (bloqueados.includes(item.id)) return;

    setSelecionadoEsquerda(prev =>
      prev?.id === item.id ? null : item
    );
  };

  const selecionarDireita = (item) => {

    if (bloqueado) return;
    if (bloqueados.includes(item.id)) return;

    setSelecionadoDireita(prev =>
      prev?.id === item.id ? null : item
    );
  };

  // =========================
  // 🧠 VERIFICAÇÃO
  // =========================

  const verificar = () => {

    if (!selecionadoEsquerda || !selecionadoDireita || bloqueado) return;

    setBloqueado(true);

    if (selecionadoEsquerda.grupo === selecionadoDireita.grupo) {

      setBloqueados(prev => [
        ...prev,
        selecionadoEsquerda.id,
        selecionadoDireita.id
      ]);

      setAcertos(prev => [...prev, selecionadoEsquerda.grupo]);

      setSelecionadoEsquerda(null);
      setSelecionadoDireita(null);
      setBloqueado(false);

    } else {

      setErro(true);

      setTimeout(() => {
        setErro(false);
        setSelecionadoEsquerda(null);
        setSelecionadoDireita(null);
        setBloqueado(false);
      }, 700);
    }
  };

  useEffect(() => {
    if (selecionadoEsquerda && selecionadoDireita) {
      const timer = setTimeout(verificar, 200);
      return () => clearTimeout(timer);
    }
  }, [selecionadoEsquerda, selecionadoDireita]);

  // =========================
  // 🎯 FINAL DA FASE (CORRIGIDO)
  // =========================

  useEffect(() => {
    if (acertos.length === 5) {

      const faseAtual = Array.isArray(params.faseId)
        ? params.faseId[0]
        : params.faseId || "1";

      // fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        router.replace({
          pathname: "/",
          params: { faseConcluida: String(faseAtual) }
        });
      }, 500);
    }
  }, [acertos]);

  // =========================
  // 🛡️ PROTEÇÃO (ANTI TELA BRANCA)
  // =========================

  if (!rodada?.esquerda || !rodada?.direita) {
    return null;
  }

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
  // 🖥️ RENDER
  // =========================

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

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

    </Animated.View>
  );
}