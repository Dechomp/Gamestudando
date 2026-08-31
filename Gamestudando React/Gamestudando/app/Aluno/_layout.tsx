import { Tabs, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { colors } from "../colors";
import { carregarPerfil } from "../utils/perfilAluno";

const rotasSemAbas = new Set(["jogoBatalhaMatematica", "cosmoletrando"]);

export default function AlunoLayout() {
  const [alunoMaker, setAlunoMaker] = useState(false);

  useFocusEffect(useCallback(() => {
    carregarPerfil().then((perfil) => setAlunoMaker(perfil?.tipo === "aluno_maker"));
  }, []));

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.certa,
        tabBarStyle: rotasSemAbas.has(route.name) ? { display: "none" } : undefined,
      })}
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
        name="maker"
        options={{
          href: alunoMaker ? undefined : null,
          title: "Maker",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct" color={color} size={size} />
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
      <Tabs.Screen name="aguardandoTurmaMaker" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="LeitorQr" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="vincularResponsavel" options={{ href: null }} />
      <Tabs.Screen name="telaMapa" options={{ href: null }} />
      <Tabs.Screen name="telaQuiz" options={{ href: null }} />
      <Tabs.Screen
        name="jogoBatalhaMatematica"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cosmoletrando"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen name="telaQuiz4Matematica" options={{ href: null }} />
      <Tabs.Screen name="telaQuiz4Portugues" options={{ href: null }} />
      <Tabs.Screen name="telaQuizRimas" options={{ href: null }} />
    </Tabs>
  );
}
