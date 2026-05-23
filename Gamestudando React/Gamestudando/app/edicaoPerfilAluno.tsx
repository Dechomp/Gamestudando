import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native";

import { useRouter } from "expo-router";
import { styles } from "./styles";

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

            setTimeout(() => {
              router.replace("/");
            }, 200);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.telaComTopoSeguro}>

      <Text style={styles.editarTitulo}>
        Editar Perfil
      </Text>

      <Text style={styles.label}>Nome</Text>

      <TextInput
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />

      <TouchableOpacity
        onPress={salvar}
        style={styles.botaoSalvar}
      >
        <Text style={styles.textoBotao}>Salvar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={resetar}
        style={styles.botaoResetar}
      >
        <Text style={styles.textoBotao}>Resetar Perfil</Text>
      </TouchableOpacity>

    </View>
  );
}
