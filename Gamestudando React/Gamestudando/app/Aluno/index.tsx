import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { SplashLoading, useVideoTransition } from "../_components/VideoTransition";
import { styles } from "../styles";
import {
    carregarPerfilUsuarioAtual,
    observarUsuarioLogado,
    obterRotaInicialPorPerfil,
    sairDaConta,
    sessaoDeAlunoExpirou
} from "../utils/authUsuario";
import {
    carregarPerfil,
    obterOuCriarMateriaDaFase
} from "../utils/perfilAluno";
import { listarTurmasDoAluno } from "../utils/firebaseTurmas";
import { escolherProximaAtividade } from "../utils/ia";

const FASES_POR_MUNDO = 15;

export default function MapaFases() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [faseLiberada, setFaseLiberada] = useState(1);
  const [faseMakerLiberada, setFaseMakerLiberada] = useState(1);
  const [recomendacao, setRecomendacao] = useState(null);
  const [materiasPorFase, setMateriasPorFase] = useState({});
  const [mundoVisualizado, setMundoVisualizado] = useState(1);
  const [trilhaSelecionada, setTrilhaSelecionada] = useState("escolar");
  const [trilhaInicializada, setTrilhaInicializada] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [verificandoLogin, setVerificandoLogin] = useState(true);
  const { showVideo, hideVideo } = useVideoTransition();

  const faseConcluida = Array.isArray(params.faseConcluida)
    ? params.faseConcluida[0]
    : params.faseConcluida;
  const materiaConcluida = Array.isArray(params.materia)
    ? params.materia[0]
    : params.materia;

  const calcularIA = useCallback(async () => {
    try {
      const perfil = await carregarPerfil();
      if (!trilhaInicializada) {
        setTrilhaSelecionada(perfil?.tipo === "aluno_maker" ? "maker" : "escolar");
        setTrilhaInicializada(true);
      }

      if (!perfil?.progresso?.avaliacaoInicialConcluida) {
        router.replace("/Aluno/avaliacaoInicial");
        return;
      }
      setRecomendacao(escolherProximaAtividade(perfil, ["matematica", "portugues"]));
      setMateriasPorFase(perfil?.progresso?.materiasPorFase || {});

    } catch (error) {
      console.log("Erro calculando IA:", error);
    }
  }, [router, trilhaInicializada]);

  const carregarMapa = useCallback(async () => {
    // Junta progresso local e Firebase para nao perder fase liberada.
    showVideo();
    try {
      const perfil = await carregarPerfil();
      const salvo = await AsyncStorage.getItem("faseLiberada");
      const salvoMaker = await AsyncStorage.getItem("faseLiberadaMaker");
      const faseSalva = salvo ? parseInt(salvo) : 1;
      const fasePerfil = parseInt(String(perfil?.progresso?.faseLiberada || 1));
      const maiorConcluida = parseInt(String(perfil?.progresso?.maiorFaseConcluida || 0));
      const faseMakerPerfil = parseInt(String(perfil?.progresso?.faseLiberadaMaker || 1));
      const maiorMakerConcluida = parseInt(String(perfil?.progresso?.maiorFaseMakerConcluida || 0));

      let novaFaseLiberada = Math.max(
        1,
        isNaN(faseSalva) ? 1 : faseSalva,
        isNaN(fasePerfil) ? 1 : fasePerfil,
        isNaN(maiorConcluida) ? 1 : maiorConcluida + 1
      );
      let novaFaseMakerLiberada = Math.max(1, isNaN(parseInt(String(salvoMaker))) ? 1 : parseInt(String(salvoMaker)), isNaN(faseMakerPerfil) ? 1 : faseMakerPerfil, isNaN(maiorMakerConcluida) ? 1 : maiorMakerConcluida + 1);

    if (faseConcluida) {
      const concluida = parseInt(String(faseConcluida));

      if (!isNaN(concluida)) {
        if (materiaConcluida === "maker") {
          novaFaseMakerLiberada = Math.max(novaFaseMakerLiberada, concluida + 1);
          await AsyncStorage.setItem("faseLiberadaMaker", String(novaFaseMakerLiberada));
        } else {
          novaFaseLiberada = Math.max(novaFaseLiberada, concluida + 1);
          await AsyncStorage.setItem("faseLiberada", String(novaFaseLiberada));
        }
      }
    }

    setFaseLiberada(novaFaseLiberada);
    setFaseMakerLiberada(novaFaseMakerLiberada);
    await AsyncStorage.setItem("faseLiberada", String(novaFaseLiberada));
    await AsyncStorage.setItem("faseLiberadaMaker", String(novaFaseMakerLiberada));
    setMundoVisualizado(Math.ceil(novaFaseLiberada / FASES_POR_MUNDO));
    await calcularIA();
  } catch (error) {
    console.log("Erro carregando mapa:", error);
  } finally {
    hideVideo();
  }
}, [calcularIA, faseConcluida, hideVideo, materiaConcluida, showVideo]);

  useFocusEffect(
    useCallback(() => {
      if (usuarioLogado) {
        carregarMapa();
      }
    }, [carregarMapa, usuarioLogado])
  );

  useEffect(() => {
    // Confere login e tipo de conta antes de mostrar o mapa.
    const parar = observarUsuarioLogado(async (usuario) => {
      if (!usuario) {
        setUsuarioLogado(false);
        setRecomendacao(null);
        setMateriasPorFase({});
        setVerificandoLogin(false);
        router.replace("/Auth/login");
        return;
      }

      const perfil = await carregarPerfilUsuarioAtual();

      if (await sessaoDeAlunoExpirou(usuario.uid, perfil?.tipo)) {
        await sairDaConta();
        setUsuarioLogado(false);
        setVerificandoLogin(false);
        Alert.alert("Sessão encerrada", "Por segurança, a sessão do aluno foi encerrada após 12 horas. Entre novamente.");
        router.replace("/Auth/login");
        return;
      }

      // Aluno Maker só acessa o app após o professor ler seu QR e vinculá-lo à turma.
      if (perfil?.tipo === "aluno_maker") {
        const turmasMaker = await listarTurmasDoAluno().catch(() => []);
        if (turmasMaker.length === 0) {
          setUsuarioLogado(true);
          setVerificandoLogin(false);
          router.replace("/Aluno/aguardandoTurmaMaker");
          return;
        }
        setUsuarioLogado(true);
        setVerificandoLogin(false);
        return;
      }
      const rotaInicial = obterRotaInicialPorPerfil(perfil);

      if (rotaInicial !== "/Aluno") {
        setUsuarioLogado(true);
        setVerificandoLogin(false);
        router.replace(rotaInicial);
        return;
      }

      setUsuarioLogado(true);
      setVerificandoLogin(false);
    });

    return parar;
  }, [router]);

  useEffect(() => {
    if (faseConcluida) {
      router.replace("/Aluno");
    }
  }, [faseConcluida, router]);

  useEffect(() => {
    const faseDaTrilha = trilhaSelecionada === "maker" ? faseMakerLiberada : faseLiberada;
    setMundoVisualizado(Math.ceil(faseDaTrilha / FASES_POR_MUNDO));
  }, [faseLiberada, faseMakerLiberada, trilhaSelecionada]);

  const mundoAtual = mundoVisualizado;
  const primeiraFaseDoMundo =
    (mundoAtual - 1) * FASES_POR_MUNDO + 1;

  const escolherMateriaDaFase = useCallback((faseId) => {
    const materiaSalva = materiasPorFase[String(faseId)];
    if (materiaSalva) return materiaSalva;

    // A cada três fases, intercala a outra matéria; nas demais, reforça a maior dificuldade.
    const prioridade = recomendacao?.materia || "portugues";
    if (faseId % 3 === 0) return prioridade === "matematica" ? "portugues" : "matematica";
    return prioridade;
  }, [materiasPorFase, recomendacao]);

  const fases = useMemo(() => {
    return Array.from({ length: FASES_POR_MUNDO }, (_, i) => {
      const id = primeiraFaseDoMundo + i;

      return {
        id,
        numeroNoMundo: i + 1,
        trilha: trilhaSelecionada,
        materia: trilhaSelecionada === "maker" ? "maker" : escolherMateriaDaFase(id),
      };
    });
  }, [escolherMateriaDaFase, primeiraFaseDoMundo, trilhaSelecionada]);

  const faseLiberadaDaTrilha = trilhaSelecionada === "maker" ? faseMakerLiberada : faseLiberada;
  const mundoMaximoLiberado = Math.ceil(faseLiberadaDaTrilha / FASES_POR_MUNDO);

  function escolherTela(materia, faseId) {
    // Decide se a fase abre quiz, batalha, rimas ou Cosmoletrando.
    const usarQuiz = faseId % 2 === 0;

    if (materia === "matematica") {
      return usarQuiz
        ? "/Aluno/telaQuiz4Matematica"
        : "/Aluno/jogoBatalhaMatematica";
    }

    if (materia === "portugues") {
      return usarQuiz
        ? "/Aluno/telaQuiz4Portugues"
        : "/Aluno/jogoBatalhaMatematica";
    }

    if (materia === "maker") return "/Aluno/telaQuiz4Portugues";

    if (materia === "rimas") return "/Aluno/telaQuizRimas";
    if (materia === "cosmoletrando") return "/Aluno/cosmoletrando";

    return usarQuiz
      ? "/Aluno/telaQuiz4Portugues"
      : "/Aluno/jogoBatalhaMatematica";
  }

  async function abrirFase(fase) {
    if (fase.trilha === "maker") {
      router.push({ pathname: escolherTela("maker", fase.id), params: { faseId: String(fase.id), materia: "maker" } });
      return;
    }
    const materia = await obterOuCriarMateriaDaFase(fase.id, fase.materia);
    setMateriasPorFase((anteriores) => ({ ...anteriores, [String(fase.id)]: materia }));

    router.push({
      pathname: escolherTela(materia, fase.id),
      params: { faseId: String(fase.id), materia }
    });
  }

  function nomeDoMundo(numero) {
    const lugares = [
      "Caverna",
      "Bosque",
      "Castelo",
      "Vale",
      "Ilha",
      "Torre",
      "Jardim",
      "Montanha",
      "Portal",
      "Templo"
    ];

    const temas = [
      "Esmeralda",
      "das Letras",
      "dos Numeros",
      "das Rimas",
      "Dourada",
      "Cristalina",
      "do Saber",
      "Encantada",
      "Azul",
      "Solar"
    ];

    const lugar = lugares[(numero - 1) % lugares.length];
    const tema =
      temas[Math.floor((numero - 1) / lugares.length) % temas.length];

    return `${lugar} ${tema}`;
  }

  if (verificandoLogin) {
    return <SplashLoading />;
  }

  return (
    <ScrollView contentContainerStyle={styles.mapaContainer}>

      <Text style={styles.mapaTitulo}>
        MAPA DE FASES
      </Text>

      <View style={styles.mapaTrilhas}>
        {[{ id: "escolar", nome: "Português e Matemática" }, { id: "maker", nome: "Maker" }].map((trilha) => (
          <TouchableOpacity key={trilha.id} onPress={() => setTrilhaSelecionada(trilha.id)} style={[styles.mapaTrilhaBotao, trilhaSelecionada === trilha.id && styles.mapaTrilhaBotaoAtivo]}>
            <Text style={[styles.mapaTrilhaTexto, trilhaSelecionada === trilha.id && styles.mapaTrilhaTextoAtivo]}>{trilha.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.mapaMundoSubtitulo}>
        {trilhaSelecionada === "maker" ? "Trilha Maker: robótica, Arduino, sensores e projetos práticos." : "Trilha escolar: Português e Matemática no mesmo caminho de tarefas."}
      </Text>

      <View style={styles.mapaMundoHeader}>
        <TouchableOpacity
          disabled={mundoVisualizado <= 1}
          style={[
            styles.botaoMundoCircular,
            mundoVisualizado <= 1 && styles.botaoMundoDesabilitado
          ]}
          onPress={() =>
            setMundoVisualizado(prev => Math.max(1, prev - 1))
          }
        >
          <Text style={styles.textoMundoSeta}>{"<"}</Text>
        </TouchableOpacity>

        <View style={styles.mapaMundoCentro}>
          <Text style={styles.mapaMundoTitulo}>
            Mundo {mundoAtual}
          </Text>

          <Text style={styles.mapaMundoNome}>
            {nomeDoMundo(mundoAtual)}
          </Text>

        </View>

        <TouchableOpacity
          disabled={mundoVisualizado >= mundoMaximoLiberado}
          style={[
            styles.botaoMundoCircular,
            mundoVisualizado >= mundoMaximoLiberado &&
              styles.botaoMundoDesabilitado
          ]}
          onPress={() =>
            setMundoVisualizado(prev =>
              Math.min(mundoMaximoLiberado, prev + 1)
            )
          }
        >
          <Text style={styles.textoMundoSeta}>{">"}</Text>
        </TouchableOpacity>
      </View>

      {fases.map((fase, index) => {

        const liberada = fase.id <= faseLiberadaDaTrilha;

        return (
          <View key={fase.id} style={styles.faseContainer}>

            <View style={[
              styles.faseWrapper,
              index % 2 === 0
                ? styles.faseEsquerda
                : styles.faseDireita
            ]}>

              <TouchableOpacity
                disabled={!liberada}
                onPress={() => abrirFase(fase)}
                style={[styles.botaoFase, liberada ? styles.faseLiberada : styles.faseBloqueada]}
              >
                <Text style={styles.textoFase}>{fase.trilha === "maker" ? "⚙" : fase.numeroNoMundo}</Text>
              </TouchableOpacity>

            </View>

            {index < fases.length - 1 && (
              <View style={styles.linhaFases} />
            )}

          </View>
        );
      })}
    </ScrollView>
  );
}
