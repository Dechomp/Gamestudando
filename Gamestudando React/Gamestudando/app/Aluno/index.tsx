import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { escolherProximaAtividade } from "../utils/ia";
import {
  carregarPerfilUsuarioAtual,
  observarUsuarioLogado,
  obterRotaInicialPorPerfil
} from "../utils/authUsuario";
import {
  carregarPerfil,
  obterOuCriarMateriaDaFase
} from "../utils/perfilAluno";
import { styles } from "../styles";

const FASES_POR_MUNDO = 15;

export default function MapaFases() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [faseLiberada, setFaseLiberada] = useState(1);
  const [recomendacao, setRecomendacao] = useState(null);
  const [mundoVisualizado, setMundoVisualizado] = useState(1);
  const [materiasPorFase, setMateriasPorFase] = useState({});
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [verificandoLogin, setVerificandoLogin] = useState(true);

  const faseConcluida = Array.isArray(params.faseConcluida)
    ? params.faseConcluida[0]
    : params.faseConcluida;

  const calcularIA = useCallback(async () => {
    try {
      const perfil = await carregarPerfil();

      if (!perfil?.progresso?.avaliacaoInicialConcluida) {
        router.replace("/Aluno/avaliacaoInicial");
        return;
      }

      const resultado = escolherProximaAtividade(perfil);
      setRecomendacao(resultado);
      setMateriasPorFase(perfil?.progresso?.materiasPorFase || {});
    } catch (error) {
      console.log("Erro calculando IA:", error);
    }
  }, [router]);

  const carregarMapa = useCallback(async () => {
    const salvo = await AsyncStorage.getItem("faseLiberada");
    const faseSalva = salvo ? parseInt(salvo) : 1;

    let novaFaseLiberada = isNaN(faseSalva) ? 1 : faseSalva;

    if (faseConcluida) {
      const concluida = parseInt(String(faseConcluida));

      if (!isNaN(concluida)) {
        novaFaseLiberada = Math.max(novaFaseLiberada, concluida + 1);

        await AsyncStorage.setItem(
          "faseLiberada",
          String(novaFaseLiberada)
        );
      }
    }

    setFaseLiberada(novaFaseLiberada);
    setMundoVisualizado(Math.ceil(novaFaseLiberada / FASES_POR_MUNDO));
    await calcularIA();
  }, [calcularIA, faseConcluida]);

  useFocusEffect(
    useCallback(() => {
      if (usuarioLogado) {
        carregarMapa();
      }
    }, [carregarMapa, usuarioLogado])
  );

  useEffect(() => {
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

  const escolherMateriaDaFase = useCallback((faseId) => {
    const materiaSalva = materiasPorFase[String(faseId)];

    if (materiaSalva) return materiaSalva;

    const materiaIA = recomendacao?.materia;

    return materiaIA || escolherMateriaPadrao(faseId);
  }, [materiasPorFase, recomendacao]);

  const mundoAtual = mundoVisualizado;
  const primeiraFaseDoMundo =
    (mundoAtual - 1) * FASES_POR_MUNDO + 1;

  const fases = useMemo(() => {
    return Array.from({ length: FASES_POR_MUNDO }, (_, i) => {
      const id = primeiraFaseDoMundo + i;

      return {
        id,
        numeroNoMundo: i + 1,
        materia: escolherMateriaDaFase(id)
      };
    });
  }, [escolherMateriaDaFase, primeiraFaseDoMundo]);

  const mundoMaximoLiberado = Math.ceil(faseLiberada / FASES_POR_MUNDO);

  function escolherMateriaPadrao(faseId) {
    if (faseId % 3 === 0) return "rimas";
    if (faseId % 2 === 0) return "matematica";
    return "portugues";
  }

  function escolherTela(materia) {
    if (materia === "matematica") return "/Aluno/jogoBatalhaMatematica";
    if (materia === "portugues") return "/Aluno/jogoBatalhaMatematica";
    if (materia === "rimas") return "/Aluno/telaQuizRimas";

    return "/Aluno/telaQuiz4Portugues";
  }

  async function abrirFase(fase) {
    const materia = await obterOuCriarMateriaDaFase(
      fase.id,
      fase.materia
    );

    setMateriasPorFase(prev => ({
      ...prev,
      [String(fase.id)]: materia
    }));

    router.push({
      pathname: escolherTela(materia),
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
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Verificando login...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.mapaContainer}>

      <Text style={styles.mapaTitulo}>
        MAPA DE FASES
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

        const liberada = fase.id <= faseLiberada;

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
                style={[
                  styles.botaoFase,
                  liberada
                    ? styles.faseLiberada
                    : styles.faseBloqueada
                ]}
              >
                <Text style={styles.textoFase}>
                  {fase.numeroNoMundo}
                </Text>
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
