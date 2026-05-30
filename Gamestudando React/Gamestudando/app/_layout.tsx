import { useEffect } from "react";
import { Appearance, StatusBar } from "react-native";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
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
    Appearance.setColorScheme("light");
  }, []);

  return (
    <ThemeProvider value={temaClaro}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.branco} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.branco },
        }}
      >
        <Stack.Screen name="(aluno)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(professor)" />
        <Stack.Screen name="(responsavel)" />
        <Stack.Screen name="(tarefas)" />
        <Stack.Screen name="(legado)" />
      </Stack>
    </ThemeProvider>
  );
}
