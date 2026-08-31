import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

type GameCardProps = {
  title: string;
  subject: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  available?: boolean;
  onPress?: () => void;
};

export default function Jogos() {
  const router = useRouter();
  const [mostrarEscolhaBatalha, setMostrarEscolhaBatalha] = useState(false);
  const [mostrarEscolhaCosmoletrando, setMostrarEscolhaCosmoletrando] = useState(false);

  function abrirBatalha(materia: "matematica" | "portugues" | "maker", heroi: "knight" | "mage" | "maker") {
    router.push({
      pathname: "/Aluno/jogoBatalhaMatematica",
      params: {
        faseId: "teste-jogos",
        materia,
        heroi,
        origem: "jogos",
      },
    });
  }

  function abrirCosmoletrando(tema: "normal" | "maker") {
    // A escolha chega ao jogo como parâmetro e mantém os dois bancos separados.
    router.push({
      pathname: "/Aluno/cosmoletrando",
      params: { missionWord: tema === "maker" ? "SENSOR" : "GATO", tema },
    });
  }

  return (
    <SafeAreaView style={screenStyles.screen}>
      <ScrollView contentContainerStyle={screenStyles.content}>
        <Text style={screenStyles.title}>Jogos</Text>
        <Text style={screenStyles.subtitle}>
          Escolha um jogo para testar direto, sem passar pelo mapa de fases.
        </Text>

        <GameCard
          title="Batalha dos Numeros"
          subject="Matematica"
          description="Responda as perguntas antes que os monstrinhos cheguem no guerreiro."
          icon="game-controller"
          available
          onPress={() => setMostrarEscolhaBatalha((value) => !value)}
        />

        {mostrarEscolhaBatalha && (
          <View style={screenStyles.choicePanel}>
            <Text style={screenStyles.choiceTitle}>Escolha como quer testar</Text>
            <View style={screenStyles.choiceGrid}>
              <Pressable
                style={({ pressed }) => [
                  screenStyles.choiceButton,
                  pressed && screenStyles.cardPressed,
                ]}
                onPress={() => abrirBatalha("matematica", "knight")}
              >
                <Ionicons name="shield" size={28} color="#ffffff" />
                <View style={screenStyles.choiceTextBox}>
                  <Text style={screenStyles.choiceName}>Guerreiro</Text>
                  <Text style={screenStyles.choiceSubject}>Matematica</Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [screenStyles.choiceButton, screenStyles.choiceButtonMaker, pressed && screenStyles.cardPressed]}
                onPress={() => abrirBatalha("maker", "maker")}
              >
                <Ionicons name="construct" size={28} color="#ffffff" />
                <View style={screenStyles.choiceTextBox}>
                  <Text style={screenStyles.choiceName}>Maker</Text>
                  <Text style={screenStyles.choiceSubject}>Robótica e Arduino</Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  screenStyles.choiceButton,
                  screenStyles.choiceButtonMage,
                  pressed && screenStyles.cardPressed,
                ]}
                onPress={() => abrirBatalha("portugues", "mage")}
              >
                <Ionicons name="sparkles" size={28} color="#ffffff" />
                <View style={screenStyles.choiceTextBox}>
                  <Text style={screenStyles.choiceName}>Mago</Text>
                  <Text style={screenStyles.choiceSubject}>Portugues</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}

        <GameCard
          title="Cosmoletrando"
          subject="Português e Maker"
          description="Destrua meteoros, colete letras e escolha entre palavras normais ou Maker."
          icon="rocket"
          available
          onPress={() => setMostrarEscolhaCosmoletrando((value) => !value)}
        />

        {mostrarEscolhaCosmoletrando && (
          <View style={screenStyles.choicePanel}>
            <Text style={screenStyles.choiceTitle}>Escolha o banco de palavras</Text>
            <View style={screenStyles.choiceGrid}>
              <Pressable
                style={({ pressed }) => [screenStyles.choiceButton, pressed && screenStyles.cardPressed]}
                onPress={() => abrirCosmoletrando("normal")}
              >
                <Ionicons name="text" size={28} color="#ffffff" />
                <View style={screenStyles.choiceTextBox}>
                  <Text style={screenStyles.choiceName}>Palavras normais</Text>
                  <Text style={screenStyles.choiceSubject}>Português, leitura e palavras do dia a dia</Text>
                </View>
              </Pressable>
              <Pressable
                style={({ pressed }) => [screenStyles.choiceButton, screenStyles.choiceButtonMaker, pressed && screenStyles.cardPressed]}
                onPress={() => abrirCosmoletrando("maker")}
              >
                <Ionicons name="hardware-chip" size={28} color="#ffffff" />
                <View style={screenStyles.choiceTextBox}>
                  <Text style={screenStyles.choiceName}>Palavras Maker</Text>
                  <Text style={screenStyles.choiceSubject}>Robótica, Arduino, sensores e projetos</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function GameCard({ title, subject, description, icon, available, onPress }: GameCardProps) {
  return (
    <Pressable
      disabled={!available}
      onPress={onPress}
      style={({ pressed }) => [
        screenStyles.card,
        !available && screenStyles.cardDisabled,
        pressed && screenStyles.cardPressed,
      ]}
    >
      <View style={[screenStyles.iconBox, !available && screenStyles.iconBoxDisabled]}>
        <Ionicons name={icon} size={30} color={available ? "#ffffff" : "#667085"} />
      </View>

      <View style={screenStyles.cardText}>
        <View style={screenStyles.cardHeader}>
          <Text style={screenStyles.cardTitle}>{title}</Text>
          <Text style={[screenStyles.badge, !available && screenStyles.badgeDisabled]}>
            {available ? "Testar" : "Em breve"}
          </Text>
        </View>

        <Text style={screenStyles.subject}>{subject}</Text>
        <Text style={screenStyles.description}>{description}</Text>
      </View>

      {available && (
        <Ionicons name="chevron-forward" size={24} color="#344054" />
      )}
    </Pressable>
  );
}

const screenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4fbf6",
  },
  content: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 110,
  },
  title: {
    color: "#152033",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    alignSelf: "center",
    color: "#53627a",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 22,
    marginTop: 8,
    maxWidth: 420,
    textAlign: "center",
  },
  card: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d0e8d8",
    borderRadius: 8,
    borderWidth: 2,
    elevation: 2,
    flexDirection: "row",
    marginBottom: 14,
    minHeight: 118,
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  choicePanel: {
    backgroundColor: "#ffffff",
    borderColor: "#d0e8d8",
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 14,
    marginTop: -4,
    padding: 12,
  },
  choiceTitle: {
    color: "#152033",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
  },
  choiceGrid: {
    flexDirection: "column",
    gap: 10,
  },
  choiceButton: {
    alignItems: "center",
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 64,
    padding: 12,
  },
  choiceButtonMage: {
    backgroundColor: "#7c3aed",
  },
  choiceButtonMaker: {
    backgroundColor: "#0f766e",
  },
  choiceButtonDisabled: {
    opacity: 0.58,
  },
  choiceTextBox: {
    flex: 1,
  },
  choiceName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  choiceSubject: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  cardDisabled: {
    backgroundColor: "#eef2f6",
    borderColor: "#d5dce5",
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: "#2f9e44",
    borderRadius: 8,
    height: 58,
    justifyContent: "center",
    marginRight: 14,
    width: 58,
  },
  iconBoxDisabled: {
    backgroundColor: "#d0d5dd",
  },
  cardText: {
    flex: 1,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  cardTitle: {
    color: "#152033",
    flex: 1,
    fontSize: 19,
    fontWeight: "900",
  },
  badge: {
    backgroundColor: "#dcfce7",
    borderRadius: 8,
    color: "#166534",
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeDisabled: {
    backgroundColor: "#e4e7ec",
    color: "#667085",
  },
  subject: {
    color: "#2f9e44",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 3,
  },
  description: {
    color: "#53627a",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 6,
  },
});
