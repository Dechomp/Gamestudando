import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../colors";

export default function AlunoLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.certa,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfilAluno"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="jogos"
        options={{
          title: "Jogos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="avaliacaoInicial"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen name="edicaoPerfilAluno" options={{ href: null }} />
      <Tabs.Screen name="entrarTurma" options={{ href: null }} />
      <Tabs.Screen name="vincularResponsavel" options={{ href: null }} />
      <Tabs.Screen name="telaMapa" options={{ href: null }} />
      <Tabs.Screen name="telaQuiz" options={{ href: null }} />
      <Tabs.Screen name="jogoBatalhaMatematica" options={{ href: null }} />
      <Tabs.Screen name="telaQuiz4Matematica" options={{ href: null }} />
      <Tabs.Screen name="telaQuiz4Portugues" options={{ href: null }} />
      <Tabs.Screen name="telaQuizRimas" options={{ href: null }} />
    </Tabs>
  );
}
