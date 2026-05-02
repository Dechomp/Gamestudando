import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { escolherProximaAtividade } from "./utils/ia";
import { carregarPerfil } from "./utils/perfilAluno";

const TOTAL_FASES = 15;

export default function MapaFases() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [faseLiberada, setFaseLiberada] = useState(1);
  const [recomendacao, setRecomendacao] = useState(null);

  // =========================
  // 🧠 IA
  // =========================
  useEffect(() => {
    const calcularIA = async () => {
      const perfil = await carregarPerfil();
      const resultado = escolherProximaAtividade(perfil);

      setRecomendacao(resultado);
    };

    calcularIA();
  }, []);

  // =========================
  // 📦 progresso salvo
  // =========================
  useEffect(() => {
    const carregar = async () => {
      const salvo = await AsyncStorage.getItem("faseLiberada");
      if (salvo) setFaseLiberada(parseInt(salvo));
    };

    carregar();
  }, []);

  // =========================
  // 🔓 liberar fases
  // =========================
  useEffect(() => {
    if (params?.faseConcluida) {

      const valor = Array.isArray(params.faseConcluida)
        ? params.faseConcluida[0]
        : params.faseConcluida;

      const concluida = parseInt(valor || "1");

      if (!isNaN(concluida)) {

        const proxima = concluida + 1;

        if (proxima > faseLiberada) {
          const novaFase = Math.min(TOTAL_FASES, proxima);

          setFaseLiberada(novaFase);
          AsyncStorage.setItem("faseLiberada", String(novaFase));
        }
      }
    }
  }, [params?.faseConcluida, faseLiberada]);

  // =========================
  // 📚 matéria por fase (IA + fallback)
  // =========================
  function escolherMateriaDaFase(faseId) {

    const materiaIA = recomendacao?.materia;

    if (materiaIA) return materiaIA;

    if (faseId % 3 === 0) return "rimas";
    if (faseId % 2 === 0) return "matematica";
    return "portugues";
  }

  const fases = useMemo(() => {
    return Array.from({ length: TOTAL_FASES }, (_, i) => {
      const id = i + 1;

      return {
        id,
        materia: escolherMateriaDaFase(id)
      };
    });
  }, [recomendacao, faseLiberada]);

  // =========================
  // 📚 telas
  // =========================
  function escolherTela(materia) {
    if (materia === "matematica") return "/telaQuiz4Matematica";
    if (materia === "portugues") return "/telaQuiz4Portugues";
    if (materia === "rimas") return "/telaQuizRimas";

    return "/telaQuiz4Portugues";
  }

  // =========================
  // 🎮 UI
  // =========================
  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>

      <Text style={{ fontSize: 26, textAlign: "center", marginBottom: 20, fontWeight: "bold" }}>
        MAPA DE FASES
      </Text>

      {/* 🧠 ainda visível (como você pediu) */}
      <Text style={{ textAlign: "center", marginBottom: 10 }}>
        IA atual: {recomendacao ? JSON.stringify(recomendacao) : "calculando..."}
      </Text>

      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.removeItem("faseLiberada");
          setFaseLiberada(1);
          router.replace("/");
        }}
      >
        <Text>RESETAR PROGRESSO</Text>
      </TouchableOpacity>

      {fases.map((fase, index) => {

        const liberada = fase.id <= faseLiberada;

        return (
          <View key={fase.id} style={{ alignItems: "center" }}>

            <View
              style={{
                alignSelf: index % 2 === 0 ? "flex-start" : "flex-end",
                marginVertical: 20
              }}
            >
              <TouchableOpacity
                disabled={!liberada}
                onPress={() =>
                  router.push({
                    pathname: escolherTela(fase.materia),
                    params: {
                      faseId: String(fase.id)
                    }
                  })
                }
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: liberada ? "#4CAF50" : "#BDBDBD",
                  elevation: 5
                }}
              >
                {/* ❌ REMOVIDO: materia visível */}
                <Text style={{ color: "#fff", fontSize: 22 }}>
                  {fase.id}
                </Text>

              </TouchableOpacity>
            </View>

            {index < fases.length - 1 && (
              <View
                style={{
                  width: 4,
                  height: 50,
                  backgroundColor: "#ccc",
                  borderRadius: 2
                }}
              />
            )}

          </View>
        );
      })}
    </ScrollView>
  );
}