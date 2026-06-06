import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Appearance } from "react-native";
import { VideoTransitionProvider } from "./_components/VideoTransition";
import { colors } from "./colors";

const temaClaro = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.branco,
    card: colors.branco,
    text: colors.textoPrimario,
    border: colors.cinzaClaro,
    primary: colors.primaria,
    notification: colors.errada,
  },
};

export default function Layout() {
  useEffect(() => {
    Appearance.setColorScheme?.("light");
  }, []);

  return (
    <ThemeProvider value={temaClaro}>
      <StatusBar style="dark" backgroundColor={colors.branco} />
      <VideoTransitionProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.branco },
          }}
        >
        <Stack.Screen name="Aluno" />
        <Stack.Screen name="Auth" />
        <Stack.Screen name="Professor" />
        <Stack.Screen name="Responsavel" />
        <Stack.Screen name="Tarefas" />
        <Stack.Screen name="Legado" />
      </Stack>
      </VideoTransitionProvider>
    </ThemeProvider>
  );
}
