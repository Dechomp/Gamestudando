import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native";

import { useRouter } from "expo-router";

import {
  carregarPerfil,
  atualizarDadosBasicos,
  resetarPerfil
} from "./utils/perfilAluno";

export default function PerfilEditar() {

  const router = useRouter();
  const [nome, setNome] = useState("");

  useEffect(() => {
    const carregar = async () => {
      const dados = await carregarPerfil();
      setNome(dados.nome || "");
    };

    carregar();
  }, []);

  // =========================
  // 💾 SALVAR
  // =========================
  const salvar = async () => {
    await atualizarDadosBasicos({ nome });

    Alert.alert("Sucesso", "Dados atualizados!");

    // 🔥 navegação garantida
    setTimeout(() => {
      router.replace("/");
    }, 200);
  };

  // =========================
  // 🔄 RESET
  // =========================
  const resetar = () => {
    Alert.alert(
      "Atenção",
      "Isso vai apagar TODOS os dados!",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: async () => {

            await resetarPerfil();

            Alert.alert("Resetado!", "Perfil limpo com sucesso.");

            // 🔥 navegação garantida
            setTimeout(() => {
              router.replace("/");
            }, 200);
          }
        }
      ]
    );
  };

  return (
    <View style={{ padding: 20 }}>

      <Text style={{ fontSize: 22, marginBottom: 10 }}>
        Editar Perfil
      </Text>

      <Text>Nome</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginBottom: 10
        }}
      />

      <TouchableOpacity
        onPress={salvar}
        style={{
          backgroundColor: "#4CAF50",
          padding: 10,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 10
        }}
      >
        <Text style={{ color: "#fff" }}>Salvar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={resetar}
        style={{
          backgroundColor: "#F44336",
          padding: 10,
          borderRadius: 8,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#fff" }}>Resetar Perfil</Text>
      </TouchableOpacity>

    </View>
  );
}