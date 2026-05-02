import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";

import { carregarPerfil } from "./utils/perfilAluno";
import { PieChart } from "react-native-gifted-charts";

export default function PerfilAluno() {

  const router = useRouter();
  const [perfil, setPerfil] = useState(null);

  // =========================
  // 📥 carregar sempre que voltar
  // =========================
  const carregar = async () => {
    const dados = await carregarPerfil();
    setPerfil(dados);
  };

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  if (!perfil) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Carregando perfil...</Text>
      </View>
    );
  }

  // =========================
  // 🧮 AGRUPAMENTO
  // =========================
  const matematica = perfil.matematica;

  const portugues = {
    acertos: perfil.portugues.acertos + perfil.rimas.acertos,
    erros: perfil.portugues.erros + perfil.rimas.erros
  };

  const areas = [
    { nome: "Matemática", dados: matematica },
    { nome: "Português", dados: portugues },
  ];

  const gerarDadosPizza = (acertos, erros) => [
    { value: acertos, color: "#4CAF50" },
    { value: erros, color: "#F44336" }
  ];

  // =========================
  // 🖥️ UI
  // =========================
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>

      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>
        📊 Relatório do Aluno
      </Text>

      <Text style={{ marginBottom: 15 }}>
        👤 {perfil.nome || "Aluno"}
      </Text>

      {areas.map((area, index) => {

        const acertos = area.dados.acertos || 0;
        const erros = area.dados.erros || 0;
        const total = acertos + erros;

        const percentual =
          total === 0 ? 0 : Math.round((acertos / total) * 100);

        return (
          <View key={index} style={{
            marginBottom: 25,
            padding: 15,
            borderRadius: 12,
            backgroundColor: "#fff",
            elevation: 3
          }}>

            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {area.nome}
            </Text>

            <View style={{ alignItems: "center", marginTop: 10 }}>
              <PieChart
                data={gerarDadosPizza(acertos, erros)}
                donut
                radius={90}
                innerRadius={55}
                focusOnPress
                sectionAutoFocus
                centerLabelComponent={() => (
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    {percentual}%
                  </Text>
                )}
              />
            </View>

            <Text style={{ marginTop: 10 }}>
              Acertos: {acertos} | Erros: {erros}
            </Text>

          </View>
        );
      })}

      <TouchableOpacity
        onPress={() => router.push("/edicaoPerfilAluno")}
        style={{
          backgroundColor: "#2196F3",
          padding: 12,
          borderRadius: 10,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Editar perfil
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}