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
  extrairCodigoAlunoResponsavel,
  vincularAlunoPorCodigoResponsavel,
} from "../utils/firebaseResponsaveis";

export default function VincularAluno() {
  const [codigo, setCodigo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const vincular = async (valorCodigo = codigo) => {
    if (salvando) return;

    try {
      setSalvando(true);
      const aluno = await vincularAlunoPorCodigoResponsavel(
        extrairCodigoAlunoResponsavel(valorCodigo)
      );

      setCodigo("");

      Alert.alert(
        "Aluno vinculado",
        `${aluno.nome || "Aluno"} agora aparece nos seus relatorios.`
      );

      router.replace("/Responsavel/RelatorioResponsavel");
    } catch (error) {
      console.log(error);
      Alert.alert("Vincular aluno", mensagemErro(error));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView
      style={styles.portalContainer}
      contentContainerStyle={styles.portalContent}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        style={styles.botaoVoltarTarefa}
        onPress={() => router.back()}
      >
        <Text style={styles.textoVoltarTarefa}>{"<-"} Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.portalTituloMenor}>Vincular aluno</Text>

      <Text style={styles.label}>Codigo do aluno</Text>
      <TextInput
        style={styles.input}
        value={codigo}
        onChangeText={(texto) => setCodigo(texto.toUpperCase())}
        placeholder="Ex: ABC1234"
        autoCapitalize="characters"
      />

      <TouchableOpacity
        style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
        disabled={salvando}
        onPress={() => vincular()}
      >
        <Text style={styles.textoBotao}>
          {salvando ? "Vinculando..." : "Vincular por codigo"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botaoEditar, styles.botaoPerfilEspacado]}
        onPress={() => router.push("/Responsavel/LeitorQrAluno")}
      >
        <Text style={styles.textoBotao}>
          Ler QR Code
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

function mensagemErro(error) {
  if (error?.message === "CODIGO_ALUNO_VAZIO") {
    return "Digite o codigo do aluno.";
  }

  if (error?.message === "ALUNO_NAO_ENCONTRADO") {
    return "Nao encontramos um aluno ativo com esse codigo.";
  }

  return "Nao foi possivel vincular o aluno agora.";
}
