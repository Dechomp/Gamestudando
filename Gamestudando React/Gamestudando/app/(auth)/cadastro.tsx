import React, { useCallback, useRef, useState } from "react";
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

import { cadastrarAlunoEmail } from "../utils/authUsuario";
import { styles } from "../styles";

export default function Cadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [tipoConta, setTipoConta] = useState("aluno");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const scrollRef = useRef(null);
  const [carregando, setCarregando] = useState(false);
  const textoNome = tipoConta === "aluno"
    ? "Nome do estudante"
    : tipoConta === "professor"
      ? "Nome do professor"
      : "Nome do responsavel";

  useFocusEffect(
    useCallback(() => {
      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");
      setTipoConta("aluno");
      setMostrarSenha(false);
    }, [])
  );

  function rolarParaBaixo() {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }

  async function cadastrar() {
    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      Alert.alert("Cadastro", "Preencha nome, email e senha.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Cadastro", "As senhas nao conferem.");
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Cadastro", "A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setCarregando(true);
      const { perfil } = await cadastrarAlunoEmail({
        nome,
        email,
        senha,
        tipo: tipoConta
      });

      Alert.alert(
        "Conta criada",
        "Enviamos um email de verificacao. Voce ja pode comecar a usar o app."
      );

      if (perfil?.tipo === "professor") {
        router.replace("/PerfilProfessor");
        return;
      }

      if (perfil?.tipo === "responsavel") {
        router.replace("/PerfilResponsavel");
        return;
      }

      router.replace(
        perfil?.progresso?.avaliacaoInicialConcluida
          ? "/"
          : "/avaliacaoInicial"
      );
    } catch (error) {
      console.log("Erro no cadastro:", error);
      Alert.alert("Cadastro", mensagemErroAuth(error));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.authKeyboard}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.authContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.authCard}>
          <Text style={styles.authTitulo}>Criar conta</Text>

          <Text style={styles.authSubtitulo}>
            Comece com os dados essenciais da conta.
          </Text>

          <Text style={styles.label}>Tipo de conta</Text>

          <View style={styles.tipoContaContainer}>
            {[
              { valor: "aluno", texto: "Estudante" },
              { valor: "professor", texto: "Professor" },
              { valor: "responsavel", texto: "Responsavel" }
            ].map(opcao => (
              <TouchableOpacity
                key={opcao.valor}
                style={[
                  styles.tipoContaBotao,
                  tipoConta === opcao.valor &&
                    styles.tipoContaBotaoSelecionado
                ]}
                onPress={() => setTipoConta(opcao.valor)}
              >
                <Text
                  style={[
                    styles.tipoContaTexto,
                    tipoConta === opcao.valor &&
                      styles.tipoContaTextoSelecionado
                  ]}
                >
                  {opcao.texto}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{textoNome}</Text>
          <TextInput
            value={nome}
            onChangeText={setNome}
            style={styles.input}
            placeholder={textoNome}
          />

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
              placeholder="Minimo 6 caracteres"
              onFocus={rolarParaBaixo}
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

          <Text style={styles.label}>Confirmar senha</Text>
          <View style={styles.senhaContainer}>
            <TextInput
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              style={styles.inputSenha}
              secureTextEntry={!mostrarSenha}
              placeholder="Digite a senha novamente"
              onFocus={rolarParaBaixo}
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
            onPress={cadastrar}
          >
            <Text style={styles.textoBotao}>
              {carregando ? "Criando..." : "Criar conta"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authLinkBotao}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.authLinkTexto}>
              Ja tenho conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function mensagemErroAuth(error) {
  const codigo = error?.code || "";

  if (codigo.includes("email-already-in-use")) {
    return "Ja existe uma conta com esse email.";
  }

  if (codigo.includes("invalid-email")) {
    return "Digite um email valido.";
  }

  if (codigo.includes("weak-password")) {
    return "A senha esta fraca. Use pelo menos 6 caracteres.";
  }

  return "Nao foi possivel criar a conta agora.";
}
