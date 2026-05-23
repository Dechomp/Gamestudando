import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(aluno)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(professor)" />
      <Stack.Screen name="(responsavel)" />
      <Stack.Screen name="(tarefas)" />
      <Stack.Screen name="(legado)" />
    </Stack>
  );
}
