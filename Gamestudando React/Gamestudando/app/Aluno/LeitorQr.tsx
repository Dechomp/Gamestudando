import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";

import { styles } from "../styles";
import { entrarEmTurmaPorCodigo, extrairCodigoTurma } from "../utils/firebaseTurmas";
import { alunoVincularResponsavelPorCodigo, extrairCodigoResponsavel } from "../utils/firebaseResponsaveis";

export default function LeitorQrAluno() {
  const params = useLocalSearchParams(); const tipo = Array.isArray(params.tipo) ? params.tipo[0] : params.tipo;
  const [processando, setProcessando] = useState(false); const [permission, requestPermission] = useCameraPermissions();
  const voltar = () => router.back();
  const ler = async ({ data }: { data: string }) => { if (processando) return; try { setProcessando(true); if (tipo === "responsavel") { const responsavel = await alunoVincularResponsavelPorCodigo(extrairCodigoResponsavel(data)); Alert.alert("Responsável vinculado", `${responsavel.nome} foi vinculado.`, [{ text: "OK", onPress: voltar }]); } else { const turma = await entrarEmTurmaPorCodigo(extrairCodigoTurma(data)); Alert.alert("Turma vinculada", `Você entrou na turma ${turma.nome}.`, [{ text: "OK", onPress: voltar }]); } } catch (error) { setProcessando(false); Alert.alert("QR Code", mensagemErro(error)); } };
  const titulo = tipo === "responsavel" ? "Ler QR do responsável" : "Ler QR da turma";
  if (!permission?.granted) return <View style={styles.leitorQrTela}><Text style={styles.leitorQrTitulo}>{titulo}</Text><TouchableOpacity style={styles.botaoSalvar} onPress={requestPermission}><Text style={styles.textoBotao}>Permitir câmera</Text></TouchableOpacity><TouchableOpacity style={styles.botaoSair} onPress={voltar}><Text style={styles.textoBotao}>Voltar</Text></TouchableOpacity></View>;
  return <View style={styles.leitorQrTela}><CameraView style={styles.leitorQrCamera} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={processando ? undefined : ler} /><View style={styles.leitorQrRodape}><Text style={styles.leitorQrTitulo}>{titulo}</Text><Text style={styles.leitorQrTexto}>{processando ? "Registrando..." : "Aponte a câmera para o QR Code."}</Text><TouchableOpacity style={styles.botaoSair} onPress={voltar}><Text style={styles.textoBotao}>Cancelar</Text></TouchableOpacity></View></View>;
}

function mensagemErro(error: any) {
  const mensagem = error?.message || "";
  if (mensagem.includes("TURMA_NAO_ENCONTRADA")) return "Não encontramos uma turma ativa para este QR. Peça ao professor para abrir o QR da turma atual.";
  if (mensagem.includes("permission-denied")) return "Sem permissão para entrar na turma. As regras do Firebase precisam ser publicadas.";
  return `Não foi possível concluir. ${mensagem || "Tente novamente."}`;
}
