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
  alunoVincularResponsavelPorCodigo,
  extrairCodigoResponsavel,
} from "../utils/firebaseResponsaveis";

export default function VincularResponsavel() {
  const [codigo, setCodigo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const vincular = async (valorCodigo = codigo) => {
    if (salvando) return;

    try {
      setSalvando(true);
      const responsavel = await alunoVincularResponsavelPorCodigo(
        extrairCodigoResponsavel(valorCodigo)
      );

      setCodigo("");
      Alert.alert("Responsavel vinculado", `${responsavel.nome} foi vinculado.`);
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert("Responsavel", mensagemErro(error));
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
      <TouchableOpacity style={styles.botaoVoltarTarefa} onPress={() => router.back()}>
        <Text style={styles.textoVoltarTarefa}>{"<-"} Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.portalTituloMenor}>Vincular responsavel</Text>

      <Text style={styles.label}>Codigo do responsavel</Text>
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
        onPress={() => router.push({ pathname: "/Aluno/LeitorQr", params: { tipo: "responsavel" } })}
      >
        <Text style={styles.textoBotao}>
          Ler QR Code
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

function mensagemErro(error) {
  if (error?.message === "CODIGO_RESPONSAVEL_VAZIO") {
    return "Digite o codigo do responsavel.";
  }

  if (error?.message === "RESPONSAVEL_NAO_ENCONTRADO") {
    return "Nao encontramos um responsavel com esse codigo.";
  }

  return "Nao foi possivel vincular o responsavel agora.";
}
