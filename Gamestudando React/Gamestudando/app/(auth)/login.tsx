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

import {
  carregarPerfilUsuarioAtual,
  entrarEmailSenha,
  entrarComCredencialGoogle,
  enviarEmailRecuperacaoSenha,
  observarUsuarioLogado,
  obterRotaInicialPorPerfil
} from "../utils/authUsuario";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { obterGoogleWebClientId } from "../utils/googleAuthConfig";
import { styles } from "../styles";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);
  const googleWebClientId = obterGoogleWebClientId();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: googleWebClientId || undefined,
    androidClientId: googleWebClientId || undefined,
  });

  useEffect(() => {
    const parar = observarUsuarioLogado(async (usuario) => {
      if (!usuario) return;

      const perfil = await carregarPerfilUsuarioAtual();
      router.replace(obterRotaInicialPorPerfil(perfil));
    });

    return parar;
  }, [router]);

  useEffect(() => {
    const concluirGoogle = async () => {
      if (response?.type !== "success") return;

      const idToken = response.params?.id_token;

      if (!idToken) {
        Alert.alert("Login com Google", "Nao recebemos o token do Google.");
        return;
      }

      try {
        setCarregandoGoogle(true);
        const { perfil, precisaEscolherTipo } = await entrarComCredencialGoogle(idToken);

        if (precisaEscolherTipo) {
          router.replace("/tipoContaGoogle");
          return;
        }

        router.replace(obterRotaInicialPorPerfil(perfil));
      } catch (error) {
        console.log("Erro no Google Login:", error);
        Alert.alert("Login com Google", mensagemErroGoogle(error));
      } finally {
        setCarregandoGoogle(false);
      }
    };

    concluirGoogle();
  }, [response, router]);

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

      router.replace(obterRotaInicialPorPerfil(perfil));
    } catch (error) {
      console.log("Erro no login:", error);
      Alert.alert("Login", mensagemErroAuth(error));
    } finally {
      setCarregando(false);
    }
  }

  async function recuperarSenha() {
    if (!email.trim()) {
      Alert.alert(
        "Recuperar senha",
        "Digite seu email no campo acima para receber o link de recuperacao."
      );
      return;
    }

    try {
      await enviarEmailRecuperacaoSenha(email);

      Alert.alert(
        "Recuperar senha",
        "Se esse email estiver cadastrado, voce recebera uma mensagem para redefinir a senha."
      );
    } catch (error) {
      console.log("Erro enviando recuperacao:", error);
      Alert.alert("Recuperar senha", mensagemErroRecuperacao(error));
    }
  }

  async function entrarGoogle() {
    if (!googleWebClientId) {
      Alert.alert(
        "Login com Google",
        "Nao encontrei o Client ID do Google. Confira se o arquivo google-services.json esta em app/google-services.json."
      );
      return;
    }

    try {
      await promptAsync();
    } catch (error) {
      console.log("Erro abrindo Google Login:", error);
      Alert.alert("Login com Google", "Nao foi possivel abrir o login do Google.");
    }
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
            style={styles.authLinkBotaoSecundario}
            onPress={recuperarSenha}
          >
            <Text style={styles.authLinkTexto}>
              Esqueci minha senha
            </Text>
          </TouchableOpacity>

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
            style={[
              styles.authBotaoGoogle,
              (!request || carregandoGoogle) && styles.botaoDesabilitado
            ]}
            disabled={!request || carregandoGoogle}
            onPress={entrarGoogle}
          >
            <View style={styles.googleIcone}>
              <Text style={styles.googleIconeTexto}>G</Text>
            </View>
            <Text style={styles.authBotaoGoogleTexto}>
              {carregandoGoogle ? "Entrando..." : "Entrar com Google"}
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

function mensagemErroRecuperacao(error) {
  const codigo = error?.code || "";

  if (codigo.includes("invalid-email")) {
    return "Digite um email valido.";
  }

  if (error?.message === "EMAIL_RECUPERACAO_VAZIO") {
    return "Digite seu email para receber o link de recuperacao.";
  }

  return "Nao foi possivel enviar o email de recuperacao agora.";
}

function mensagemErroGoogle(error) {
  const codigo = error?.code || "";

  if (codigo.includes("account-exists-with-different-credential")) {
    return "Ja existe uma conta com esse email usando outro metodo de login.";
  }

  if (codigo.includes("operation-not-allowed")) {
    return "Ative o provedor Google no Firebase Authentication.";
  }

  if (codigo.includes("invalid-credential")) {
    return "A credencial do Google nao foi aceita. Confira os Client IDs.";
  }

  return "Nao foi possivel entrar com Google agora.";
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
