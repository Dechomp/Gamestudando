import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOTAL_FASES = 15;

export default function MapaFases() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 🔓 começa da fase 1
  const [faseLiberada, setFaseLiberada] = useState(1);

  // 🧠 escolhe tipo de quiz
  function escolherTela(faseId) {
    if (faseId % 3 === 0) return "/telaQuizRimas";
    if (faseId % 2 === 0) return "/telaQuiz4Matematica";
    return "/telaQuiz4Portugues";
  }

  // 🧩 AGORA cria TODAS as fases
  const fases = Array.from({ length: TOTAL_FASES }, (_, i) => ({
    id: i + 1,
    tela: escolherTela(i + 1)
  }));

  // 🔄 carregar progresso salvo
  useEffect(() => {
    const carregar = async () => {
      const salvo = await AsyncStorage.getItem("faseLiberada");
      if (salvo) setFaseLiberada(parseInt(salvo));
    };

    carregar();
  }, []);

  // 🔓 liberar próxima fase
  useEffect(() => {
  if (params?.faseConcluida) {

    const valor = Array.isArray(params.faseConcluida)
      ? params.faseConcluida[0]
      : params.faseConcluida;

    const concluida = parseInt(valor || "1");

    if (!isNaN(concluida)) {

      const proxima = concluida + 1;

      // 🔥 só atualiza se realmente for maior
      if (proxima > faseLiberada) {
        const novaFase = Math.min(TOTAL_FASES, proxima);

        setFaseLiberada(novaFase);
        AsyncStorage.setItem("faseLiberada", String(novaFase));
      }
    }
  }
}, [params?.faseConcluida, faseLiberada]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={{ fontSize: 26, textAlign: "center", marginBottom: 30, fontWeight: "bold" }}>
        MAPA DE FASES
      </Text>

      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.removeItem("faseLiberada");

          setFaseLiberada(1);

          // 🔥 limpa os params também
          router.replace("/");

          console.log("Progresso resetado!");
        }}
      >
        <Text>RESETAR PROGRESSO</Text>
      </TouchableOpacity>

      {fases.map((fase, index) => {
        const liberada = fase.id <= faseLiberada;

        return (
          <View key={fase.id} style={{ alignItems: "center" }}>

            {/* 🔘 BOTÃO */}
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
                    pathname: fase.tela,
                    params: { faseId: String(fase.id) }
                    
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
                <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
                  {fase.id}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 🛣️ estrada */}
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