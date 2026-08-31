import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";

import { styles } from "../styles";
import { extrairCodigoQrMaker, mensagemErroMaker, registrarPresencaMaker } from "../utils/firebaseMaker";

export default function LeitorQrMaker() {
  const params = useLocalSearchParams();
  const turmaId = Array.isArray(params.turmaId) ? params.turmaId[0] : params.turmaId;
  const [processando, setProcessando] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const voltar = () => router.back();
  const lerQr = async ({ data }: { data: string }) => {
    if (processando || !turmaId) return;
    try {
      setProcessando(true);
      const resultado = await registrarPresencaMaker({ turmaId, valorQr: extrairCodigoQrMaker(data) });
      Alert.alert(resultado.jaRegistrado ? "Presença já registrada" : "Presença confirmada", resultado.jaRegistrado ? `${resultado.alunoNome} já está presente hoje.` : `${resultado.alunoNome} foi marcado(a) como presente.`, [{ text: "Ler outro", onPress: () => setProcessando(false) }, { text: "Voltar à chamada", onPress: voltar }]);
    } catch (error) {
      setProcessando(false);
      Alert.alert("QR não registrado", mensagemErroMaker(error));
    }
  };

  if (!turmaId) return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Turma não selecionada.</Text></View>;
  if (!permission?.granted) return <View style={styles.leitorQrTela}><Text style={styles.leitorQrTitulo}>Ler QR do aluno</Text><Text style={styles.leitorQrTexto}>Permita o uso da câmera para registrar a presença.</Text><TouchableOpacity style={styles.botaoSalvar} onPress={requestPermission}><Text style={styles.textoBotao}>Permitir câmera</Text></TouchableOpacity><TouchableOpacity style={styles.botaoSair} onPress={voltar}><Text style={styles.textoBotao}>Voltar</Text></TouchableOpacity></View>;

  return <View style={styles.leitorQrTela}>
    <CameraView style={styles.leitorQrCamera} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={processando ? undefined : lerQr} />
    <View style={styles.leitorQrRodape}><Text style={styles.leitorQrTitulo}>Ler QR do Aluno Maker</Text><Text style={styles.leitorQrTexto}>{processando ? "Registrando presença..." : "Aponte a câmera para o QR do aluno."}</Text><TouchableOpacity style={styles.botaoSair} onPress={voltar}><Text style={styles.textoBotao}>Cancelar</Text></TouchableOpacity></View>
  </View>;
}
