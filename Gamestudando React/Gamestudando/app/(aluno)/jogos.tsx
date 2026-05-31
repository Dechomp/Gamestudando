import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
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
          onPress={() =>
            router.push({
              pathname: "/jogoBatalhaMatematica",
              params: { faseId: "teste-jogos" },
            })
          }
        />

        <GameCard
          title="Missao Espacial"
          subject="Portugues"
          description="Jogo de asteroides com letras em ordem. Aparece aqui quando a tela Skia for adicionada ao app."
          icon="rocket"
        />
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
