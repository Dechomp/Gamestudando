import React, { useState } from "react";
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  finalizarCadastroGoogle,
  obterRotaInicialPorPerfil,
  sairDaConta,
} from "../utils/authUsuario";
import { styles } from "../styles";

const TIPOS = [
  { valor: "aluno", texto: "Estudante" },
  { valor: "professor", texto: "Professor" },
  { valor: "responsavel", texto: "Responsavel" },
];

export default function TipoContaGoogle() {
  const [tipoConta, setTipoConta] = useState("aluno");
  const [salvando, setSalvando] = useState(false);

  async function continuar() {
    try {
      setSalvando(true);
      const perfil = await finalizarCadastroGoogle({ tipo: tipoConta });
      router.replace(obterRotaInicialPorPerfil(perfil));
    } catch (error) {
      console.log("Erro finalizando Google:", error);
      Alert.alert("Conta Google", "Nao foi possivel finalizar seu cadastro.");
    } finally {
      setSalvando(false);
    }
  }

  async function cancelar() {
    await sairDaConta();
    router.replace("/login");
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
