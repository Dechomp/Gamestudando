import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../colors";

export default function ResponsavelLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.certa,
      }}
    >
      <Tabs.Screen
        name="RelatorioResponsavel"
        options={{
          title: "Relatorios",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="VincularAluno"
        options={{
          title: "Vincular",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-add"
              color={color}
              size={Math.max(size + 8, 32)}
            />
          ),
        }}
      />
      <Tabs.Screen name="LeitorQrAluno" options={{ href: null, tabBarStyle: { display: "none" } }} />

      <Tabs.Screen
        name="PerfilResponsavel"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="EdicaoPerfilResponsavel"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
