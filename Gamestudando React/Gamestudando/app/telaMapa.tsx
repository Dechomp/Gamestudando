import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { styles } from "./styles";

const fases = [
  { id: 1, titulo: "Português", tela: "/telaQuiz4Portugues" },
  { id: 2, titulo: "Matemática", tela: "/telaQuiz4Matematica" },
  { id: 3, titulo: "Rimas", tela: "/telaQuizRimas" },
  { id: 4, titulo: "Desafio Bíblico", tela: "/telaQuiz" },
];

export default function MapaFases() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [faseLiberada, setFaseLiberada] = useState(1);

  useEffect(() => {
    if (params?.faseConcluida) {
      const valor = Array.isArray(params.faseConcluida)
        ? params.faseConcluida[0]
        : params.faseConcluida;

      const concluida = parseInt(valor || "1");

      if (!isNaN(concluida) && concluida + 1 > faseLiberada) {
        setFaseLiberada(concluida + 1);
      }
    }
  }, [params?.faseConcluida]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={{ fontSize: 26, textAlign: "center", marginBottom: 30, fontWeight: "bold" }}>
        MAPA DE FASES
      </Text>

      {fases.map((fase, index) => {
        const liberada = fase.id <= faseLiberada;

        return (
          <View
            key={fase.id}
            style={{
              marginVertical: 25,
              alignItems: index % 2 === 0 ? "flex-start" : "flex-end"
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

            <Text style={{ marginTop: 8, fontWeight: "500" }}>
              {fase.titulo}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}