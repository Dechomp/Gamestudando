import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

import { styles } from "../styles";
import {
    carregarPerfilUsuarioAtual,
    sairDaConta,
} from "../utils/authUsuario";
import {
    listarAlunosResponsavel,
    montarValorQrResponsavel,
    obterOuCriarCodigoResponsavel,
} from "../utils/firebaseResponsaveis";

export default function PerfilResponsavel() {
  const [perfil, setPerfil] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [codigoResponsavel, setCodigoResponsavel] = useState("");
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      const carregar = async () => {
        try {
          setCarregando(true);
          const [perfilAtual, alunosVinculados, codigo] = await Promise.all([
            carregarPerfilUsuarioAtual(),
            listarAlunosResponsavel().catch(() => []),
            obterOuCriarCodigoResponsavel().catch(() => ""),
          ]);

          if (!ativo) return;

          setPerfil(perfilAtual);
          setAlunos(alunosVinculados);
          setCodigoResponsavel(codigo);
        } catch (error) {
          console.log(error);
        } finally {
          if (ativo) setCarregando(false);
        }
      };

      carregar();

      return () => {
        ativo = false;
      };
    }, [])
  );

  const deslogar = () => {
    Alert.alert(
      "Sair da conta",
      "Deseja sair desta conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await sairDaConta();
            router.replace("/Auth/login");
          },
        },
      ]
    );
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.portalContainer}
      contentContainerStyle={styles.portalContent}
    >
      <TouchableOpacity
        style={styles.botaoVoltarTarefa}
        onPress={() => router.replace("/Responsavel/RelatorioResponsavel")}
      >
        <Text style={styles.textoVoltarTarefa}>{"<-"} Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.portalTituloMenor}>Perfil do responsavel</Text>

      <View style={styles.card}>
        <Text style={styles.portalLabel}>Nome</Text>
        <Text style={styles.portalValor}>{perfil?.nome || "Responsavel"}</Text>

        <Text style={styles.portalLabel}>Email</Text>
        <Text style={styles.portalValor}>{perfil?.email || "Sem email"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Codigo do responsavel</Text>
        <Text style={styles.turmaCodigo}>
          {codigoResponsavel || "Carregando..."}
        </Text>
        {!!codigoResponsavel && (
          <View style={styles.turmaQrBox}>
            <QRCode
              value={montarValorQrResponsavel(codigoResponsavel)}
              size={135}
            />
          </View>
        )}
        <Text style={styles.legendaTexto}>
          O aluno pode ler este codigo para se vincular a voce.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Alunos vinculados</Text>

        {alunos.length === 0 ? (
          <Text style={styles.legendaTexto}>
            Nenhum aluno vinculado ainda.
          </Text>
        ) : (
          alunos.map((aluno) => (
            <View key={aluno.id} style={styles.turmaAlunoItem}>
              <Text style={styles.configuracaoTexto}>
                {aluno.nome || "Aluno"}
              </Text>
              <Text style={styles.legendaTexto}>
                Atividades: {aluno.atividadesConcluidas || 0}
              </Text>
            </View>
          ))
        )}

        <TouchableOpacity
          style={[styles.botaoEditar, styles.botaoPerfilEspacado]}
          onPress={() => router.push("/Responsavel/VincularAluno")}
        >
          <Text style={styles.textoBotao}>Vincular aluno</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.botaoSair}
        onPress={deslogar}
      >
        <Text style={styles.textoBotao}>Sair da conta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoEditar}
        onPress={() => router.push('/Responsavel/EdicaoPerfilResponsavel')}
      >
        <Text style={styles.botaoTexto}>Editar perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
