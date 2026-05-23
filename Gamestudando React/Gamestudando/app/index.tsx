import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { escolherProximaAtividade } from "./utils/ia";
import { carregarPerfil } from "./utils/perfilAluno";
import { styles } from "./styles";

const TOTAL_FASES = 15;

export default function MapaFases() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [faseLiberada, setFaseLiberada] = useState(1);
  const [recomendacao, setRecomendacao] = useState(null);

  const faseConcluida = Array.isArray(params.faseConcluida)
    ? params.faseConcluida[0]
    : params.faseConcluida;

  const calcularIA = useCallback(async () => {
    try {
      const perfil = await carregarPerfil();
      const resultado = escolherProximaAtividade(perfil);
      setRecomendacao(resultado);
    } catch (error) {
      console.log("Erro calculando IA:", error);
    }
  }, []);

  const carregarMapa = useCallback(async () => {
    const salvo = await AsyncStorage.getItem("faseLiberada");
    const faseSalva = salvo ? parseInt(salvo) : 1;

    let novaFaseLiberada = isNaN(faseSalva) ? 1 : faseSalva;

    if (faseConcluida) {
      const concluida = parseInt(String(faseConcluida));

      if (!isNaN(concluida)) {
        novaFaseLiberada = Math.max(
          novaFaseLiberada,
          Math.min(TOTAL_FASES, concluida + 1)
        );

        await AsyncStorage.setItem(
          "faseLiberada",
          String(novaFaseLiberada)
        );
      }
    }

    setFaseLiberada(novaFaseLiberada);
    await calcularIA();
  }, [calcularIA, faseConcluida]);

  useFocusEffect(
    useCallback(() => {
      carregarMapa();
    }, [carregarMapa])
  );

  useEffect(() => {
    carregarMapa();
  }, [carregarMapa]);

  useEffect(() => {
    if (faseConcluida) {
      router.replace("/");
    }
  }, [faseConcluida, router]);

  const escolherMateriaDaFase = useCallback((faseId) => {
    const materiaIA = recomendacao?.materia;

    if (materiaIA) return materiaIA;

    if (faseId % 3 === 0) return "rimas";
    if (faseId % 2 === 0) return "matematica";
    return "portugues";
  }, [recomendacao]);

  const fases = useMemo(() => {
    return Array.from({ length: TOTAL_FASES }, (_, i) => {
      const id = i + 1;

      return {
        id,
        materia: escolherMateriaDaFase(id)
      };
    });
  }, [escolherMateriaDaFase]);

  function escolherTela(materia) {
    if (materia === "matematica") return "/telaQuiz4Matematica";
    if (materia === "portugues") return "/telaQuiz4Portugues";
    if (materia === "rimas") return "/telaQuizRimas";

    return "/telaQuiz4Portugues";
  }

  return (
    <ScrollView contentContainerStyle={styles.mapaContainer}>

      <Text style={styles.mapaTitulo}>
        MAPA DE FASES
      </Text>

      <Text style={styles.mapaIA}>
        IA atual: {recomendacao ? JSON.stringify(recomendacao) : "calculando..."}
      </Text>

      <TouchableOpacity
        style={styles.botaoReset}
        onPress={async () => {
          await AsyncStorage.removeItem("faseLiberada");
          setFaseLiberada(1);
          router.replace("/");
        }}
      >
        <Text style={styles.textoReset}>
          RESETAR PROGRESSO
        </Text>
      </TouchableOpacity>

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
                onPress={() =>
                  router.push({
                    pathname: escolherTela(fase.materia),
                    params: { faseId: String(fase.id) }
                  })
                }
                style={[
                  styles.botaoFase,
                  liberada
                    ? styles.faseLiberada
                    : styles.faseBloqueada
                ]}
              >
                <Text style={styles.textoFase}>
                  {fase.id}
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
