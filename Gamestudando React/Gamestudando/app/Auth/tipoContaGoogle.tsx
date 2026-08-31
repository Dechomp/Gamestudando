import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useVideoTransition } from "../_components/VideoTransition";
import { styles } from "../styles";
import {
    finalizarCadastroGoogle,
    obterRotaInicialPorPerfil,
    sairDaConta,
} from "../utils/authUsuario";

const TIPOS = [
  { valor: "aluno", texto: "Aluno regular" },
  { valor: "aluno_maker", texto: "Aluno Maker" },
  { valor: "professor", texto: "Professor" },
  { valor: "responsavel", texto: "Responsavel" },
];

export default function TipoContaGoogle() {
  const [tipoConta, setTipoConta] = useState("aluno");
  const [salvando, setSalvando] = useState(false);

  const { showVideo, hideVideo } = useVideoTransition();

  async function continuar() {
    try {
      setSalvando(true);
      showVideo();
      const perfil = await finalizarCadastroGoogle({ tipo: tipoConta });
      hideVideo();
      router.replace(obterRotaInicialPorPerfil(perfil));
    } catch (error) {
      hideVideo();
      console.log("Erro finalizando Google:", error);
      Alert.alert("Conta Google", "Nao foi possivel finalizar seu cadastro.");
    } finally {
      setSalvando(false);
    }
  }

  async function cancelar() {
    await sairDaConta();
    router.replace("/Auth/login");
  }

  return (
    <View style={styles.authContainer}>
      <View style={styles.authCard}>
        <Text style={styles.authTitulo}>Tipo de conta</Text>

        <Text style={styles.authSubtitulo}>
          Escolha como voce vai usar o Gamestudando.
        </Text>

        <View style={styles.tipoContaContainer}>
          {TIPOS.map((opcao) => (
            <TouchableOpacity
              key={opcao.valor}
              style={[
                styles.tipoContaBotao,
                tipoConta === opcao.valor && styles.tipoContaBotaoSelecionado,
              ]}
              onPress={() => setTipoConta(opcao.valor)}
            >
              <Text
                style={[
                  styles.tipoContaTexto,
                  tipoConta === opcao.valor && styles.tipoContaTextoSelecionado,
                ]}
              >
                {opcao.texto}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.authBotaoPrincipal,
            salvando && styles.botaoDesabilitado,
          ]}
          disabled={salvando}
          onPress={continuar}
        >
          <Text style={styles.textoBotao}>
            {salvando ? "Salvando..." : "Continuar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.authLinkBotao}
          onPress={cancelar}
        >
          <Text style={styles.authLinkTexto}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
