import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { entrarEmailSenha, observarUsuarioLogado } from "../utils/authUsuario";
import { styles } from "../styles";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const parar = observarUsuarioLogado((usuario) => {
      if (usuario) {
        router.replace("/");
      }
    });

    return parar;
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      setEmail("");
      setSenha("");
      setMostrarSenha(false);
    }, [])
  );

  async function entrar() {
    if (!email.trim() || !senha) {
      Alert.alert("Login", "Informe email e senha.");
      return;
    }

    try {
      setCarregando(true);
      const { perfil } = await entrarEmailSenha(email, senha);

      if (perfil?.tipo === "professor") {
        router.replace("/PerfilProfessor");
        return;
      }

      if (perfil?.tipo === "responsavel") {
        router.replace("/PerfilResponsavel");
        return;
      }

      if (!perfil?.progresso?.avaliacaoInicialConcluida) {
        router.replace("/avaliacaoInicial");
        return;
      }

      router.replace("/");
    } catch (error) {
      console.log("Erro no login:", error);
      Alert.alert("Login", mensagemErroAuth(error));
    } finally {
      setCarregando(false);
    }
  }

  function entrarGoogle() {
    Alert.alert(
      "Login com Google",
      "O botao ja ficou reservado. Para ativar no celular, precisamos configurar o provider Google no Firebase e os client IDs do Expo/Google."
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.authKeyboard}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.authContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.authCard}>
          <Text style={styles.authTitulo}>Entrar</Text>

          <Text style={styles.authSubtitulo}>
            Acesse sua conta para continuar estudando.
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="email@exemplo.com"
          />

          <Text style={styles.label}>Senha</Text>
          <View style={styles.senhaContainer}>
            <TextInput
              value={senha}
              onChangeText={setSenha}
              style={styles.inputSenha}
              secureTextEntry={!mostrarSenha}
              placeholder="Sua senha"
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
            style={[
              styles.authBotaoPrincipal,
              carregando && styles.botaoDesabilitado
            ]}
            disabled={carregando}
            onPress={entrar}
          >
            <Text style={styles.textoBotao}>
              {carregando ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authBotaoGoogle}
            onPress={entrarGoogle}
          >
            <Text style={styles.authBotaoGoogleTexto}>
              Entrar com Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authLinkBotao}
            onPress={() => router.push("/cadastro")}
          >
            <Text style={styles.authLinkTexto}>
              Criar conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function mensagemErroAuth(error) {
  const codigo = error?.code || "";

  if (codigo.includes("invalid-credential")) {
    return "Email ou senha incorretos.";
  }

  if (codigo.includes("user-not-found")) {
    return "Nao encontramos uma conta com esse email.";
  }

  if (codigo.includes("wrong-password")) {
    return "Senha incorreta.";
  }

  if (codigo.includes("too-many-requests")) {
    return "Muitas tentativas. Espere um pouco e tente novamente.";
  }

  return "Nao foi possivel entrar agora.";
}
