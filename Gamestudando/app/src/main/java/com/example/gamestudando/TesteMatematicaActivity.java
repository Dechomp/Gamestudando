package com.example.gamestudando;

import static android.graphics.Color.parseColor;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Random;

public class TesteMatematicaActivity extends AppCompatActivity {

    //Definição de componentes
    Button btQuestaoA, btQuestaoB, btQuestaoC, btQuestaoD, btVerificar, btSelecionado, btSelecionadoAnterior;

    TextView tvQuestaoNum, tvQuestaoTexto;

    String respCerta;

    //Contador de questões
    int numQuestao = 0;

    //Linhas do arquivo de texto
    ArrayList<String> linhas = new ArrayList<>();

    androidx.constraintlayout.widget.ConstraintLayout main;

    //Ordem das perguntas que serão aleatorizadas
    int[] ordem = new int[30];

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_teste_matematica);

        //Vinculando componentes
        btQuestaoA = findViewById(R.id.btTesteOpcaoA);
        btQuestaoB = findViewById(R.id.btTesteOpcaoB);
        btQuestaoC = findViewById(R.id.btTesteOpcaoC);
        btQuestaoD = findViewById(R.id.btTesteOpcaoD);



        tvQuestaoNum = findViewById(R.id.tvQuestaoTesteNum);
        tvQuestaoTexto = findViewById(R.id.tvQuestaoTesteTexto);

        btVerificar = findViewById(R.id.btVerificarQuestao);

        main = findViewById(R.id.main);

        //Chama a função para carregar as perguntas
        carregarPerguntas();

        //Quantidade de acertos e erros
        Global.acertos = 0;
        Global.erros = 0;

        //Quando clicar para escolher a opção A
        btQuestaoA.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //Registra o botão selecionado
                btSelecionado = btQuestaoA;

                //Chama a função
                selecionarBotao();
            }
        });

        //Quando clicar para escolher a opção B
        btQuestaoB.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //Registra o botão selecionado
                btSelecionado = btQuestaoB;

                //Chama a função
                selecionarBotao();
            }
        });

        //Quando clicar para escolher a opção C
        btQuestaoC.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //Registra o botão selecionado
                btSelecionado = btQuestaoC;

                //Chama a função
                selecionarBotao();
            }
        });

        //Quando clicar para escolher a opção D
        btQuestaoD.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //Registra o botão selecionado
                btSelecionado = btQuestaoD;

                //Chama a função
                selecionarBotao();
            }
        });

        //Quando clicar para verificar a resposta
        btVerificar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //Checa se está escrito para verificar
                if(btVerificar.getText().equals("Verificar")) {

                    //Chama a função para verificar a resposta
                    verificarResp((String) btSelecionado.getText());

                    //Desabilita os botões
                    btQuestaoA.setClickable(false);
                    btQuestaoB.setClickable(false);
                    btQuestaoC.setClickable(false);
                    btQuestaoD.setClickable(false);
                }
                else{
                    //Chama a função para a próxima pergunta
                    proxPergunta();

                    //Deseleciona o botão
                    btSelecionado = null;
                    btSelecionadoAnterior = null;

                    //Deixa o botão de verificar desabilitado e mudo a cor dele para cinza
                    btVerificar.setClickable(false);

                    //Muda o texto do botão de verificar para "Verificar" novamente
                    btVerificar.setText("Verificar");

                    //Muda a cor dos botões para cinza
                    btVerificar.setBackgroundColor(parseColor("#8E8C8C"));
                    btQuestaoA.setBackgroundColor(parseColor("#668cff"));
                    btQuestaoB.setBackgroundColor(parseColor("#668cff"));
                    btQuestaoC.setBackgroundColor(parseColor("#668cff"));
                    btQuestaoD.setBackgroundColor(parseColor("#668cff"));

                    //Habilitamos os botões
                    btQuestaoA.setClickable(true);
                    btQuestaoB.setClickable(true);
                    btQuestaoC.setClickable(true);
                    btQuestaoD.setClickable(true);

                }

            }
        });
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    //Função para trazer as perguntas registradas no arquivo de texto
    private void carregarPerguntas(){
        try {

            //Abre o arquivo de texto
            InputStream inputStream = getResources().openRawResource(R.raw.perguntasmatematica);

            //Lê o arquivo de texto
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));

            //Linha unica
            String linha;

            //Percorre o arquivo de texto, no caso enquanto a linha atual recebida não é nula
            while((linha = bufferedReader.readLine()) != null){

                //Adiciona a lista de linhas
                linhas.add(linha);
            }

            //Fecha a leitura do arquivo
            bufferedReader.close();

            //Fecha o arquivo
            inputStream.close();

            //Inicia com um valor inicial impossivel
            ordem[0] = -1;

            //Inicio da aleatorização
            //Cria um objeto para gerar números aleatórios
            Random random = new Random();
            for (int i = 0; i < 30; i++){
                //Recebe um número aletório de 0 à 29 (30 - 1)
                 int num = random.nextInt(30);

                //Percorre os números já adicionados
                int j;
                for (j = 0; j < i; j++){

                    //Caso ache um número igual, sai do laço
                    if (ordem[j] == num){
                        break;
                    }
                }

                //Caso j seja maior que i
                if (j > i){
                    //Adiciona o número
                    ordem[i] = num;
                }
                //Se não for
                else{
                    //Decrementa o i, reiniciando esta passagem
                    i--;
                }

            }
        } catch (Exception e) {
            Toast.makeText(TesteMatematicaActivity.this, "Erro na aleatorização" + e.getMessage() + e.toString(), Toast.LENGTH_SHORT).show();
        }

        //Assim que terminar de aleatorizar as perguntas, chama a função para exibir a primeira pergunta
        proxPergunta();
    }

    private void proxPergunta(){
        //Caso a lista de perguntas não esteja vazia
        if (!linhas.isEmpty()){
            //Caso não tenha chegado no final do teste
            if (numQuestao < 10){
                //Recebe a pergunta
                String pergunta = linhas.get(ordem[numQuestao]);

                //Chama a função que exibe a pergunta
                exibirPergunta(pergunta);

                //Aumenta a quantidade de questões
                numQuestao++;
            }
            else{
                //Exibe as mensagens de:

                //Conclusão do teste
                Toast.makeText(TesteMatematicaActivity.this, "Teste Terminado", Toast.LENGTH_SHORT).show();

                //Quatidade de acertos
                Toast.makeText(TesteMatematicaActivity.this, "Total de acertos: " + Global.acertos, Toast.LENGTH_SHORT).show();

                //Quatidade de erros
                Toast.makeText(TesteMatematicaActivity.this, "Total de erros: " + Global.erros, Toast.LENGTH_SHORT).show();

                //Cacula a nota (cada ponto é subtraido por 0.2)
                Double nota = Global.acertos - Global.erros * 0.2;
                //Caso a nota seja positiva
                if(nota> 0){
                    //Cria um objeto para arredondar a nota
                    DecimalFormat df = new DecimalFormat("#.##");

                    //Mostra a porntuação total
                    Toast.makeText(TesteMatematicaActivity.this, "Pontuação total: " + df.format(nota), Toast.LENGTH_SHORT).show();
                }
                //Caso a nota seja negativa
                else{
                    //Mostra que tirou 0
                    Toast.makeText(TesteMatematicaActivity.this, "Pontuação total: 0", Toast.LENGTH_SHORT).show();
                }
                //Chama a função global de navegação de tela
                //Global.navegarTela(getApplicationContext(), ResultadoTesteActivity.class);

                //Troca a cor de fundo da tela para a cor do teste
                //ResultadoTesteActivity.corFundo = main.getBackground();

                //finish();
            }

        }
    }

    //Função para exibir a pergunta
    private void exibirPergunta(String linha){
        //Divide a linha em partes, separadas por ";"
        String[] partes = linha.split(";");

        //Crio um vetor para armazenar a ordens das repostas aletóriamente
        int[] ordemRespostas = new int[4];

        //Inicia com um valor inicial impossivel
        ordemRespostas[0] = -1;

        //Inicio da aleatorização
        //Cria um objeto para gerar números aleatórios
        Random random = new Random();

        for (int i = 0; i < 4; i++){
            //Recebe um número aletório de 1 à 4 (No caso vai de 0 à 3, mas como as respostas são das posições de 1 a 4, somo +1)
            int num = random.nextInt(4) + 1;

            //Percorre os números já adicionados
            int j;
            for (j = 0; j < i; j++){

                //Caso repita o número
                if (ordemRespostas[j] == num){
                    //Sai do laço
                    break;
                }
            }

            //Caso j seja maior que i
            if (j > i){
                //Armazena o número
                ordemRespostas[i] = num;
            }
            //Caso não
            else{
                //Decrementa o i, reiniciando esta passagem
                i--;
            }

        }

        //Caso a linha tenha mais de 6 partes (a formatação do arquivo de texto tem que ser a pergunta, 4 posições de respostas e a resposta certa, totalizando 6 partes)
        if(partes.length >= 6) {
            //Recebo a pergunta (sempre é a posição 0)
            String pergunta = partes[0];

            //Recebo as repostas em ordens aleatórias (1 à 4)
            String respA = partes[ordemRespostas[0]];
            String respB = partes[ordemRespostas[1]];
            String respC = partes[ordemRespostas[2]];
            String respD = partes[ordemRespostas[3]];

            //Recebo a resposta certa (sempre é a posição 5)
            respCerta = partes[5];

            //Altera os textos
            //Número da questão
            tvQuestaoNum.setText("Questao " + (numQuestao + 1) + ":");

            //Pergunta
            tvQuestaoTexto.setText(pergunta);

            //Respostas
            btQuestaoA.setText(respA);
            btQuestaoB.setText(respB);
            btQuestaoC.setText(respC);
            btQuestaoD.setText(respD);
        }
    }

    //Função para verificar a resposta, reebendo o texto da resposta selecionada
    private void verificarResp(String repostaEsc){
        //Caso a resposta selecionada seja igual a resposta certa
        if (repostaEsc.equals(respCerta)){
            //Mostra a mensagem que acertou
            Toast.makeText(TesteMatematicaActivity.this, "Acertou!", Toast.LENGTH_SHORT).show();

            //Muda a cor dos botões para verde
            btVerificar.setBackgroundColor(parseColor("#80ff00"));
            btSelecionado.setBackgroundColor(parseColor("#80ff00"));

            //Aumenta a quantidade de acertos
            Global.acertos++;
        }
        //Caso tenha errado
        else{
            //Mostra a mensagem que errou
            Toast.makeText(TesteMatematicaActivity.this, "Errou!", Toast.LENGTH_SHORT).show();

            //Deixa os botões vermelhos
            btVerificar.setBackgroundColor(parseColor("#ff0000"));
            btSelecionado.setBackgroundColor(parseColor("#ff0000"));

            //Procura o botão com a resposta certa, se achar, deixa ele verde
            if(btQuestaoA.getText().equals(respCerta)){
                btQuestaoA.setBackgroundColor(parseColor("#80ff00"));
            }
            else if(btQuestaoB.getText().equals(respCerta)){
                btQuestaoB.setBackgroundColor(parseColor("#80ff00"));
            }
            else if(btQuestaoC.getText().equals(respCerta)){
                btQuestaoC.setBackgroundColor(parseColor("#80ff00"));
            }
            else if(btQuestaoD.getText().equals(respCerta)){
                btQuestaoD.setBackgroundColor(parseColor("#80ff00"));
            }

            //Aumenta a quantidade de erros
            Global.erros++;
        }

        //Troca o texto do botão de verificar para "Próxima"
        btVerificar.setText("Próxima");

    }

    //Função para trocar as cores dos botões ao serem selecionados
    private void selecionarBotao(){
        //Caso o botão selecionado seja diferente do anterior
        if (btSelecionado != btSelecionadoAnterior){
            //"Desseleciona" o botão anterior
            btSelecionadoAnterior.setBackgroundColor(parseColor("#668cff"));

            //Seleciona o novo botão
            btSelecionado.setBackgroundColor(parseColor("#66e0ff"));

            //Recebo o novo botão para o anterior
            btSelecionadoAnterior = btSelecionado;

            //Deixo o botão de verificar habilitado e mudo a cor dele para verde
            btVerificar.setClickable(true);
            btVerificar.setBackgroundColor(parseColor("#bfff00"));

        }
        //Caso o botão selecionado seja igual ao anterior
        else{
            //"Deseleciona" o botão
            btSelecionado.setBackgroundColor(parseColor("#668cff"));

            //Esvazio o botão anterior
            btSelecionadoAnterior = null;

            //Deixo o botão de verificar desabilitado e mudo a cor dele para cinza
            btVerificar.setClickable(false);
            btVerificar.setBackgroundColor(parseColor("#8E8C8C"));
        }


    }

}