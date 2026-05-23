import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4CAF50",
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
        name="settings"
        options={{
          href: null,
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

      <Tabs.Screen name="Aba1" options={{ href: null }} />
      <Tabs.Screen name="Aba2" options={{ href: null }} />
      <Tabs.Screen name="Aba3" options={{ href: null }} />
      <Tabs.Screen name="Aba4" options={{ href: null }} />
      <Tabs.Screen name="Aba5" options={{ href: null }} />
      <Tabs.Screen name="CriarTarefa" options={{ href: null }} />
      <Tabs.Screen name="DetalhesTarefa" options={{ href: null }} />
      <Tabs.Screen name="EditarTarefa" options={{ href: null }} />
      <Tabs.Screen name="ListarTarefas" options={{ href: null }} />
      <Tabs.Screen name="PerfilProfessor" options={{ href: null }} />
      <Tabs.Screen name="PerfilResponsavel" options={{ href: null }} />
      <Tabs.Screen name="RelatorioProfessor" options={{ href: null }} />
      <Tabs.Screen name="RelatorioResponsavel" options={{ href: null }} />
      <Tabs.Screen name="edicaoPerfilAluno" options={{ href: null }} />
      <Tabs.Screen name="telaMapa" options={{ href: null }} />
      <Tabs.Screen name="telaQuiz" options={{ href: null }} />
      <Tabs.Screen name="telaQuiz4Matematica" options={{ href: null }} />
      <Tabs.Screen name="telaQuiz4Portugues" options={{ href: null }} />
      <Tabs.Screen name="telaQuizRimas" options={{ href: null }} />
    </Tabs>
  );
}
