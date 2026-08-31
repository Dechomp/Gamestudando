import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

import { styles } from "../styles";
import {
  entrarEmTurmaPorCodigo,
  extrairCodigoTurma,
} from "../utils/firebaseTurmas";

export default function EntrarTurma() {
  const [codigo, setCodigo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const entrar = async (valorCodigo = codigo) => {
    if (salvando) return;

    try {
      setSalvando(true);
      const turma = await entrarEmTurmaPorCodigo(extrairCodigoTurma(valorCodigo));
      setCodigo("");

      Alert.alert(
        "Turma vinculada",
        `Voce entrou na turma ${turma.nome}.`
      );

      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert("Turma", mensagemErro(error));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView
      style={styles.portalContainer}
      contentContainerStyle={styles.portalContent}
    >
      <TouchableOpacity
        style={styles.botaoVoltarTarefa}
        onPress={() => router.back()}
      >
        <Text style={styles.textoVoltarTarefa}>{"<-"} Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.portalTituloMenor}>Entrar em turma</Text>

      <Text style={styles.label}>Codigo da turma</Text>
      <TextInput
        style={styles.input}
        value={codigo}
        onChangeText={(texto) => setCodigo(texto.toUpperCase())}
        placeholder="Ex: ABC123"
        autoCapitalize="characters"
      />

      <TouchableOpacity
        style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
        disabled={salvando}
        onPress={() => entrar()}
      >
        <Text style={styles.textoBotao}>
          {salvando ? "Entrando..." : "Entrar por codigo"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botaoEditar, styles.botaoPerfilEspacado]}
        onPress={() => router.push({ pathname: "/Aluno/LeitorQr", params: { tipo: "turma" } })}
      >
        <Text style={styles.textoBotao}>
          Ler QR Code
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

function mensagemErro(error) {
  if (error?.message === "TURMA_NAO_ENCONTRADA") {
    return "Nao encontramos uma turma ativa com esse codigo.";
  }

  return "Nao foi possivel entrar na turma agora.";
}
