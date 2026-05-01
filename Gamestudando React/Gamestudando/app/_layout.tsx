import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, // Esconde a barra superior se preferir
      tabBarActiveTintColor: '#4CAF50' 
    }}>
      
      {/* 1. O MAPA (Visível) */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Mapa',
          // Aqui você pode colocar um ícone de mapa depois
        }} 
      />

      {/* 2. OS QUIZZES (Escondidos da barra, mas acessíveis via botão) */}
      <Tabs.Screen 
        name="telaQuiz4Portugues" 
        options={{ href: null }} 
      />

      <Tabs.Screen 
        name="telaQuiz4Matematica" 
        options={{ href: null }} 
      />

      <Tabs.Screen 
        name="telaQuizRimas" 
        options={{ href: null }} 
      />

      <Tabs.Screen 
        name="telaQuiz" // O seu Quiz Bíblico
        options={{ href: null }} 
      />

      {/* 3. CONFIGURAÇÕES (Visível) */}
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Ajustes',
        }} 
      />

    </Tabs>
  );
}