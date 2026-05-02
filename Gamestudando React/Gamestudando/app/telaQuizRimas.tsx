import { useRouter, useLocalSearchParams } from "expo-router";
import { Text, View, TouchableOpacity, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { styles } from "./styles";
import { palavrasEsquerda, palavrasDireita } from "./perguntasQuizRimas";
import { atualizarPerfil, carregarPerfil } from "./utils/perfilAluno";

// =========================
// 🎲 embaralhar
// =========================
function embaralhar(lista) {
  return [...lista].sort(() => Math.random() - 0.5);
}

// =========================
// 🧠 geração IA (segura)
// =========================
function gerarRodadaIA(nivelAluno = 3) {

  const palavrasUsadas = [];
  const esquerdaEscolhida = [];
  const direitaEscolhida = [];

  const pool = embaralhar(palavrasEsquerda).slice(0, 5);

  pool.forEach(esq => {

    const opcoes = palavrasDireita.filter(d =>
      d.par === esq.par &&
      d.texto !== esq.texto &&
      !palavrasUsadas.includes(d.texto)
    );

    if (!opcoes || opcoes.length === 0) return;

    const dir = opcoes[Math.floor(Math.random() * opcoes.length)];

    esquerdaEscolhida.push(esq);
    direitaEscolhida.push(dir);

    palavrasUsadas.push(esq.texto);
    palavrasUsadas.push(dir.texto);
  });

  return {
    esquerda: esquerdaEscolhida,
    direita: embaralhar(direitaEscolhida),
  };
}

// =========================
// 🎮 componente
// =========================
export default function Index() {

  const router = useRouter();
  const params = useLocalSearchParams();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [nivelAluno, setNivelAluno] = useState(3);

  // ✅ FIX PRINCIPAL AQUI
  const [rodada, setRodada] = useState({
    esquerda: [],
    direita: []
  });

  const [selecionadoEsquerda, setSelecionadoEsquerda] = useState(null);
  const [selecionadoDireita, setSelecionadoDireita] = useState(null);

  const [acertos, setAcertos] = useState([]);
  const [bloqueados, setBloqueados] = useState([]);

  const [erro, setErro] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);

  const [acertosFase, setAcertosFase] = useState(0);
  const [errosFase, setErrosFase] = useState(0);

  const progresso = acertos.length / 5;

  // =========================
  // 📥 carregar perfil
  // =========================
  useEffect(() => {
    const carregar = async () => {

      const perfil = await carregarPerfil();
      const nivel = perfil?.rimas?.nivel || 3;

      setNivelAluno(nivel);

      const r = gerarRodadaIA(nivel);

      // 🔥 fallback seguro se vier incompleto
      if (!r.esquerda?.length || !r.direita?.length) {
        setRodada(gerarRodadaIA(nivel));
      } else {
        setRodada(r);
      }
    };

    carregar();
  }, []);

  // =========================
  // 🎬 fade
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
  // 🧪 loading seguro (FIX REAL DA TELA BRANCA)
  // =========================
  const carregando =
    !rodada?.esquerda?.length ||
    !rodada?.direita?.length;

  // =========================
  // 🖱️ seleção ESQ
  // =========================
  const selecionarEsquerda = (item) => {
    if (bloqueado) return;
    if (bloqueados.includes(item.id)) return;

    setSelecionadoEsquerda(prev =>
      prev?.id === item.id ? null : item
    );
  };

  // =========================
  // 🖱️ seleção DIR
  // =========================
  const selecionarDireita = (item) => {
    if (bloqueado) return;
    if (bloqueados.includes(item.id)) return;

    setSelecionadoDireita(prev =>
      prev?.id === item.id ? null : item
    );
  };

  // =========================
  // 🧠 verificação
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
      setAcertosFase(prev => prev + 1);

      setSelecionadoEsquerda(null);
      setSelecionadoDireita(null);
      setBloqueado(false);

    } else {

      setErro(true);
      setErrosFase(prev => prev + 1);

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
  // 🎯 final
  // =========================
  useEffect(() => {
    if (acertos.length === 5) {

      const faseAtual = Array.isArray(params.faseId)
        ? params.faseId[0]
        : params.faseId || "1";

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(async () => {

        await atualizarPerfil("rimas", acertosFase, errosFase);

        setTimeout(() => {
          router.replace({
            pathname: "/",
            params: { faseConcluida: String(faseAtual) }
          });
        }, 200);
      });
    }
  }, [acertos]);

  // =========================
  // 🧪 loading UI
  // =========================
  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Carregando rimas...</Text>
      </View>
    );
  }

  // =========================
  // 🎨 estilos
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
  // 🖥️ UI
  // =========================
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

      <Text style={styles.textoPergunta}>
        Conecte as rimas
      </Text>

      <Text>{acertos.length} / 5</Text>

      <View style={styles.barraContainer}>
        <View style={[styles.barraProgresso, { width: `${progresso * 100}%` }]} />
      </View>

      <View style={{ flexDirection: "row", marginTop: 20 }}>

        <View style={{ flex: 1 }}>
          {rodada.esquerda.map(item => (
            <View key={item.id} style={estiloEsquerda(item)}>
              <TouchableOpacity onPress={() => selecionarEsquerda(item)}>
                <Text style={styles.texto}>{item.texto}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }}>
          {rodada.direita.map(item => (
            <View key={item.id} style={estiloDireita(item)}>
              <TouchableOpacity onPress={() => selecionarDireita(item)}>
                <Text style={styles.texto}>{item.texto}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </View>

    </Animated.View>
  );
}