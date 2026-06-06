import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { styles } from '../styles';
import {
    atualizarEmailConta,
    atualizarSenhaConta,
    carregarPerfilUsuarioAtual
} from '../utils/authUsuario';
import { atualizarDadosBasicos } from '../utils/perfilAluno';

const EdicaoPerfilResponsavel = () => {
  const scrollRef = useRef(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [emailOriginal, setEmailOriginal] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const resetarCamposSenha = useCallback(() => {
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setMostrarSenha(false);
  }, []);

  const carregar = useCallback(async () => {
    const dados = await carregarPerfilUsuarioAtual();

    setNome(dados?.nome || '');
    setEmail(dados?.email || '');
    setEmailOriginal(dados?.email || '');
    resetarCamposSenha();
  }, [resetarCamposSenha]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetarCamposSenha();
      };
    }, [resetarCamposSenha])
  );

  const rolarParaBaixo = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const salvar = async () => {
    if (novaSenha || confirmarNovaSenha) {
      if (novaSenha !== confirmarNovaSenha) {
        Alert.alert('Senha', 'As senhas nao conferem.');
        return;
      }

      const senhaForteRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/;

      if (!senhaForteRegex.test(novaSenha)) {
        Alert.alert(
          'Senha',
          'A nova senha precisa ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.'
        );
        return;
      }
    }

    try {
      await atualizarDadosBasicos({ nome, email: emailOriginal });

      if (email.trim() && email.trim() !== emailOriginal) {
        await atualizarEmailConta(email);
        await atualizarDadosBasicos({ nome, email });
      }

      if (novaSenha) {
        await atualizarSenhaConta(novaSenha);
      }

      resetarCamposSenha();
      Alert.alert('Perfil', 'Dados atualizados.');
      router.replace('/Responsavel/PerfilResponsavel');
    } catch (error) {
      console.log(error);
      Alert.alert('Perfil', mensagemErroAuth(error));
    }
  };

  const voltar = () => {
    resetarCamposSenha();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.authKeyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.tarefaScroll}
        contentContainerStyle={styles.tarefaContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.botaoVoltarTarefa}
          onPress={voltar}
        >
          <Text style={styles.textoVoltarTarefa}>{"<-"} Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.editarTitulo}>Editar Perfil</Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          style={styles.input}
          onFocus={rolarParaBaixo}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          onFocus={rolarParaBaixo}
        />

        <Text style={styles.label}>Nova senha</Text>
        <View style={styles.senhaContainer}>
          <TextInput
            value={novaSenha}
            onChangeText={setNovaSenha}
            style={styles.inputSenha}
            secureTextEntry={!mostrarSenha}
            placeholder="Deixe vazio para manter (mín. 8 chars, maiúscula, minúscula, número e símbolo)"
            onFocus={rolarParaBaixo}
          />

          <TouchableOpacity
            style={styles.botaoMostrarSenha}
            onPress={() => setMostrarSenha(prev => !prev)}
          >
            <Text style={styles.textoMostrarSenha}>
              {mostrarSenha ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar nova senha</Text>
        <View style={styles.senhaContainer}>
          <TextInput
            value={confirmarNovaSenha}
            onChangeText={setConfirmarNovaSenha}
            style={styles.inputSenha}
            secureTextEntry={!mostrarSenha}
            placeholder="Digite a nova senha novamente"
            onFocus={rolarParaBaixo}
          />
        </View>

        <TouchableOpacity
          onPress={salvar}
          style={styles.botaoSalvar}
        >
          <Text style={styles.textoBotao}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

function mensagemErroAuth(error) {
  const codigo = error?.code || '';

  if (codigo.includes('requires-recent-login')) {
    return 'O Firebase bloqueou a troca de email/senha porque seu login ja esta antigo. O nome foi salvo, mas email/senha nao foram alterados. Saia da conta, entre de novo e tente alterar email ou senha novamente.';
  }

  if (codigo.includes('invalid-email')) {
    return 'Digite um email valido.';
  }

  if (codigo.includes('email-already-in-use')) {
    return 'Esse email ja esta sendo usado por outra conta.';
  }

  if (codigo.includes('weak-password')) {
    return 'A nova senha esta fraca. Use pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.';
  }

  return 'Nao foi possivel atualizar os dados agora.';
}

export default EdicaoPerfilResponsavel;
