import React, { useState, useCallback } from "react";
import { Alert, View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";

import { carregarPerfil, atualizarConfiguracoes } from "./utils/perfilAluno";
import { criarOuAtualizarAlunoFirebase } from "./utils/firebasePerfil";
import { PieChart } from "react-native-gifted-charts";
import { styles } from "./styles";

export default function PerfilAluno() {

  const router = useRouter();
  const [perfil, setPerfil] = useState(null);

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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Carregando perfil...
        </Text>
      </View>
    );
  }

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

  const leituraAtiva =
    perfil?.configuracoes?.leituraPerguntasAtiva !== false;

  const alternarLeitura = async (valor) => {
    const perfilAtualizado = await atualizarConfiguracoes({
      leituraPerguntasAtiva: valor
    });

    if (perfilAtualizado) {
      setPerfil(perfilAtualizado);
    }
  };

  const sincronizarFirebaseTeste = async () => {
    try {
      await criarOuAtualizarAlunoFirebase("aluno-teste-local", perfil);
      Alert.alert("Firebase", "Perfil enviado para o Firestore.");
    } catch (error) {
      console.log("Erro sincronizando Firebase:", error);
      Alert.alert("Firebase", "Nao foi possivel enviar o perfil.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.perfilContainer}>

      <Text style={styles.perfilTitulo}>
        📊 Relatório do Aluno
      </Text>

      <Text style={styles.perfilNome}>
        👤 {perfil.nome || "Aluno"}
      </Text>

      <View style={styles.configuracaoCard}>
        <Text style={styles.configuracaoTexto}>
          Leitura das perguntas
        </Text>

        <Switch
          value={leituraAtiva}
          onValueChange={alternarLeitura}
        />
      </View>

      {areas.map((area, index) => {

        const acertos = area.dados.acertos || 0;
        const erros = area.dados.erros || 0;
        const total = acertos + erros;

        const percentual =
          total === 0 ? 0 : Math.round((acertos / total) * 100);

        return (
          <View key={index} style={styles.card}>

            <Text style={styles.areaTitulo}>
              {area.nome}
            </Text>

            <View style={styles.graficoContainer}>
              <PieChart
                data={gerarDadosPizza(acertos, erros)}
                donut
                radius={90}
                innerRadius={55}
                focusOnPress
                sectionAutoFocus
                centerLabelComponent={() => (
                  <Text style={styles.porcentagem}>
                    {percentual}%
                  </Text>
                )}
              />
            </View>

            <View style={styles.legendaContainer}>

              <View style={styles.legendaItem}>
                <View style={[styles.legendaCor, styles.legendaAcerto]} />
                <Text style={styles.legendaTexto}>
                  Acertos: {acertos}
                </Text>
              </View>

              <View style={styles.legendaItem}>
                <View style={[styles.legendaCor, styles.legendaErro]} />
                <Text style={styles.legendaTexto}>
                  Erros: {erros}
                </Text>
              </View>

            </View>

          </View>
        );
      })}

      <TouchableOpacity
        style={styles.botaoEditar}
        onPress={() => router.push("/edicaoPerfilAluno")}
      >
        <Text style={styles.botaoTexto}>
          Editar perfil
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botaoEditar, styles.botaoFirebaseTeste]}
        onPress={sincronizarFirebaseTeste}
      >
        <Text style={styles.botaoTexto}>
          Enviar teste para Firebase
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
} 
