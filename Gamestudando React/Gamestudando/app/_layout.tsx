import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="Aba1" options={{ title: 'Aba 1' }} />
      <Tabs.Screen name="Aba2" options={{ title: 'Aba 2' }} />
      <Tabs.Screen name="Aba3" options={{ title: 'Aba 3' }} />
      <Tabs.Screen name="Aba4" options={{ title: 'Aba 4' }} />
      <Tabs.Screen name="Aba5" options={{ title: 'Aba 5' }} />
    </Tabs>
  );
}