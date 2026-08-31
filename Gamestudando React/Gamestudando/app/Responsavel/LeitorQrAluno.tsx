import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { styles } from "../styles";
import { extrairCodigoAlunoResponsavel, vincularAlunoPorCodigoResponsavel } from "../utils/firebaseResponsaveis";

export default function LeitorQrAluno() {
  const [processando, setProcessando] = useState(false); const [permission, requestPermission] = useCameraPermissions(); const voltar = () => router.back();
  const ler = async ({ data }) => { if (processando) return; try { setProcessando(true); const aluno = await vincularAlunoPorCodigoResponsavel(extrairCodigoAlunoResponsavel(data)); Alert.alert("Aluno vinculado", `${aluno.nome || "Aluno"} agora aparece nos seus relatórios.`, [{ text: "OK", onPress: () => router.replace("/Responsavel/RelatorioResponsavel") }]); } catch { setProcessando(false); Alert.alert("QR Code", "Não foi possível vincular este aluno."); } };
  if (!permission?.granted) return <View style={styles.leitorQrTela}><Text style={styles.leitorQrTitulo}>Ler QR do aluno</Text><TouchableOpacity style={styles.botaoSalvar} onPress={requestPermission}><Text style={styles.textoBotao}>Permitir câmera</Text></TouchableOpacity><TouchableOpacity style={styles.botaoSair} onPress={voltar}><Text style={styles.textoBotao}>Voltar</Text></TouchableOpacity></View>;
  return <View style={styles.leitorQrTela}><CameraView style={styles.leitorQrCamera} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={processando ? undefined : ler} /><View style={styles.leitorQrRodape}><Text style={styles.leitorQrTitulo}>Ler QR do aluno</Text><Text style={styles.leitorQrTexto}>{processando ? "Vinculando..." : "Aponte a câmera para o QR Code."}</Text><TouchableOpacity style={styles.botaoSair} onPress={voltar}><Text style={styles.textoBotao}>Cancelar</Text></TouchableOpacity></View></View>;
}
