import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";

import { styles } from "../styles";
import {
  entrarEmTurmaPorCodigo,
  extrairCodigoTurma,
} from "../utils/firebaseTurmas";

export default function EntrarTurma() {
  const [codigo, setCodigo] = useState("");
  const [lendoQr, setLendoQr] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const entrar = async (valorCodigo = codigo) => {
    if (salvando) return;

    try {
      setSalvando(true);
      setLendoQr(false);
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

  const alternarLeitorQr = async () => {
    if (lendoQr) {
      setLendoQr(false);
      return;
    }

    if (Platform.OS === "web") {
      Alert.alert("QR Code", "A leitura por camera deve ser testada no celular.");
      return;
    }

    if (!permission?.granted) {
      const resposta = await requestPermission();

      if (!resposta.granted) {
        Alert.alert("Camera", "Permita o uso da camera para ler o QR Code.");
        return;
      }
    }

    setLendoQr(true);
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
        onPress={alternarLeitorQr}
      >
        <Text style={styles.textoBotao}>
          {lendoQr ? "Fechar QR Code" : "Ler QR Code"}
        </Text>
      </TouchableOpacity>

      {lendoQr && (
        <View style={styles.qrScannerContainer}>
          <CameraView
            style={styles.qrScanner}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={salvando ? undefined : ({ data }) => entrar(data)}
          />

          <Text style={styles.legendaTexto}>
            Aponte a camera para o QR Code da turma.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function mensagemErro(error) {
  if (error?.message === "TURMA_NAO_ENCONTRADA") {
    return "Nao encontramos uma turma ativa com esse codigo.";
  }

  return "Nao foi possivel entrar na turma agora.";
}
