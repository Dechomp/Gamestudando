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
  alunoVincularResponsavelPorCodigo,
  extrairCodigoResponsavel,
} from "../utils/firebaseResponsaveis";

export default function VincularResponsavel() {
  const [codigo, setCodigo] = useState("");
  const [lendoQr, setLendoQr] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const vincular = async (valorCodigo = codigo) => {
    if (salvando) return;

    try {
      setSalvando(true);
      setLendoQr(false);
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
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={salvando ? undefined : ({ data }) => vincular(data)}
          />
          <Text style={styles.legendaTexto}>
            Aponte a camera para o QR Code do responsavel.
          </Text>
        </View>
      )}
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
