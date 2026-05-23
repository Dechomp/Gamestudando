import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native";

import { useRouter } from "expo-router";
import { styles } from "../styles";

import {
  carregarPerfil,
  atualizarDadosBasicos,
  resetarPerfil
} from "../utils/perfilAluno";
import {
  atualizarEmailConta,
  atualizarSenhaConta
} from "../utils/authUsuario";

export default function PerfilEditar() {

  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      const dados = await carregarPerfil();
      setNome(dados.nome || "");
      setEmail(dados.email || "");
    };

    carregar();
  }, []);

  // =========================
  // 💾 SALVAR
  // =========================
  const salvar = async () => {
    if (novaSenha || confirmarNovaSenha) {
      if (novaSenha !== confirmarNovaSenha) {
        Alert.alert("Senha", "As senhas nao conferem.");
        return;
      }

      if (novaSenha.length < 6) {
        Alert.alert("Senha", "A senha precisa ter pelo menos 6 caracteres.");
        return;
      }
    }

    try {
      if (email.trim()) {
        await atualizarEmailConta(email);
      }

      if (novaSenha) {
        await atualizarSenhaConta(novaSenha);
      }

      await atualizarDadosBasicos({ nome, email });

      setNovaSenha("");
      setConfirmarNovaSenha("");

      Alert.alert("Sucesso", "Dados atualizados!");

      setTimeout(() => {
        router.replace("/perfilAluno");
      }, 200);
    } catch (error) {
      console.log("Erro ao salvar perfil:", error);
      Alert.alert("Perfil", mensagemErroAuth(error));
    }
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

            const perfilResetado = await resetarPerfil();
            setNome(perfilResetado?.nome || "");
            setEmail(perfilResetado?.email || "");
            setNovaSenha("");
            setConfirmarNovaSenha("");

            Alert.alert("Resetado!", "Perfil limpo com sucesso.");

            setTimeout(() => {
              router.replace("/perfilAluno");
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

      <Text style={styles.label}>Email</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Nova senha</Text>

      <View style={styles.senhaContainer}>
        <TextInput
          value={novaSenha}
          onChangeText={setNovaSenha}
          style={styles.inputSenha}
          secureTextEntry={!mostrarSenha}
          placeholder="Deixe vazio para manter"
        />

        <TouchableOpacity
          style={styles.botaoMostrarSenha}
          onPress={() => setMostrarSenha(prev => !prev)}
        >
          <Text style={styles.textoMostrarSenha}>
            {mostrarSenha ? "Ocultar" : "Mostrar"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Confirmar nova senha</Text>

      <View style={styles.senhaContainer}>
        <TextInput
          value={confirmarNovaSenha}
          onChangeText={setConfirmarNovaSenha}
          style={styles.inputSenha}
          secureTextEntry={!mostrarSenha}
          placeholder="Digite a nova senha novamente"
        />

        <TouchableOpacity
          style={styles.botaoMostrarSenha}
          onPress={() => setMostrarSenha(prev => !prev)}
        >
          <Text style={styles.textoMostrarSenha}>
            {mostrarSenha ? "Ocultar" : "Mostrar"}
          </Text>
        </TouchableOpacity>
      </View>

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

function mensagemErroAuth(error) {
  const codigo = error?.code || "";

  if (codigo.includes("requires-recent-login")) {
    return "Por seguranca, saia e entre novamente antes de mudar email ou senha.";
  }

  if (codigo.includes("invalid-email")) {
    return "Digite um email valido.";
  }

  if (codigo.includes("email-already-in-use")) {
    return "Esse email ja esta sendo usado por outra conta.";
  }

  if (codigo.includes("weak-password")) {
    return "A nova senha esta fraca. Use pelo menos 6 caracteres.";
  }

  return "Nao foi possivel atualizar os dados agora.";
}
