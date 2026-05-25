import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../colors";

export default function ProfessorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.certa,
      }}
    >
      <Tabs.Screen
        name="RelatorioProfessor"
        options={{
          title: "Relatorios",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="CriarProfessor"
        options={{
          title: "Criar",
          tabBarLabel: "Criar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="add-circle"
              color={color}
              size={Math.max(size + 12, 38)}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="PerfilProfessor"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="CriarAtividade"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="CriarTurma"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="DetalhesTurma"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="EdicaoPerfilProfessor"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
