package com.example.gamestudando;

import static android.graphics.Color.parseColor;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.util.ArrayList;

public class TesteMatematicaActivity extends AppCompatActivity {

    Button btQuestaoA, btQuestaoB, btQuestaoC, btQuestaoD, btVerificar, btSelecionado, btSelecionadoAnterior;

    TextView tvQuestaoNum, tvQuestaoTexto;

    String respCerta;

    int numQuestao = 0;

    ArrayList<String> linhas = new ArrayList<>();

    androidx.constraintlayout.widget.ConstraintLayout main;

    int[] ordem = new int[30];

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_teste_matematica);

        btQuestaoA = findViewById(R.id.btTesteOpcaoA);
        btQuestaoB = findViewById(R.id.btTesteOpcaoB);
        btQuestaoC = findViewById(R.id.btTesteOpcaoC);
        btQuestaoD = findViewById(R.id.btTesteOpcaoD);



        tvQuestaoNum = findViewById(R.id.tvQuestaoTesteNum);
        tvQuestaoTexto = findViewById(R.id.tvQuestaoTesteTexto);

        btVerificar = findViewById(R.id.btVerificarQuestao);

        main = findViewById(R.id.main);
        //carregarPerguntas();

        Global.acertos = 0;
        Global.erros = 0;

        btQuestaoA.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                btSelecionado = btQuestaoA;
                selecionarBotao();
            }
        });

        btQuestaoB.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                btSelecionado = btQuestaoB;
                selecionarBotao();
            }
        });

        btQuestaoC.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                btSelecionado = btQuestaoC;
                selecionarBotao();
            }
        });

        btQuestaoD.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                btSelecionado = btQuestaoD;
                selecionarBotao();
            }
        });

        btVerificar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                /*if(btVerificar.getText().equals("Verificar")) {
                    verificarResp((String) btSelecionado.getText());
                    btQuestao1a.setClickable(false);
                    btQuestao1b.setClickable(false);
                    btQuestao1c.setClickable(false);
                    btQuestao1d.setClickable(false);
                }
                else{
                    proxPergunta();
                    btSelecionado = null;
                    btVerificar.setClickable(false);
                    btVerificar.setText("Verificar");
                    btVerificar.setBackgroundColor(parseColor("#8E8C8C"));
                    btQuestao1a.setBackgroundColor(parseColor("#668cff"));
                    btQuestao1b.setBackgroundColor(parseColor("#668cff"));
                    btQuestao1c.setBackgroundColor(parseColor("#668cff"));
                    btQuestao1d.setBackgroundColor(parseColor("#668cff"));

                    btQuestao1a.setClickable(true);
                    btQuestao1b.setClickable(true);
                    btQuestao1c.setClickable(true);
                    btQuestao1d.setClickable(true);

                }*/

            }
        });
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    private void carregarPerguntas(){
        /*try {
            InputStream inputStream = getResources().openRawResource(R.raw.perguntassql);

            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));

            String linha;

            while((linha = bufferedReader.readLine()) != null){
                linhas.add(linha);
            }

            bufferedReader.close();
            inputStream.close();


            ordem[0] = -1;


            for (int i = 0; i < 30; i++){
                Random random = new Random();
                int num = random.nextInt(30);

                int diferente = 0;

                for (int j = 0; j < i; j++){
                    if (ordem[j] != num){
                        diferente++;
                    }
                }

                if (diferente >= i){
                    ordem[i] = num;
                }
                else{
                    i--;
                }

            }


        } catch (Exception e) {
            Toast.makeText(TesteActivity.this, "Erro na aleatorização" + e.getMessage() + e.toString(), Toast.LENGTH_SHORT).show();
        }

        proxPergunta();*/
    }

    private void proxPergunta(){
        /*if (!linhas.isEmpty()){
            if (numQuestao < 10){
                String pergunta = linhas.get(ordem[numQuestao]);
                exibirPergunta(pergunta);
                numQuestao++;
            }
            else{
                Toast.makeText(TesteSqlActivity.this, "Teste Terminado", Toast.LENGTH_SHORT).show();
                Toast.makeText(TesteSqlActivity.this, "Total de acertos: " + Global.acertosSql, Toast.LENGTH_SHORT).show();
                Toast.makeText(TesteSqlActivity.this, "Total de erros: " + Global.errosSql, Toast.LENGTH_SHORT).show();

                if(Global.acertosSql - Global.errosSql * 0.2 > 0){
                    DecimalFormat df = new DecimalFormat("#.##");
                    Toast.makeText(TesteSqlActivity.this, "Pontuação total: " + df.format(Global.acertosSql - Global.errosSql * 0.2), Toast.LENGTH_SHORT).show();
                }
                else{

                    Toast.makeText(TesteSqlActivity.this, "Pontuação total: 0", Toast.LENGTH_SHORT).show();
                }

                Intent intent = new Intent(TesteSqlActivity.this, ResultadoTesteActivity.class);
                ResultadoTesteActivity.corFundo = main.getBackground();
                startActivity(intent);

                ResultadoTesteActivity.quantAcertos = Global.acertosSql;
                ResultadoTesteActivity.quantErros = Global.errosSql;

                finish();
            }

        }*/
    }
    private void exibirPergunta(String linha){
        /*String[] partes = linha.split(";");

        int[] ordemPerguntas = new int[4];

        ordemPerguntas[0] = -1;
        for (int i = 0; i < 4; i++){
            Random random = new Random();
            int num = random.nextInt(4) + 1;

            int diferente = 0;

            for (int j = 0; j < i; j++){
                if (ordemPerguntas[j] != num){
                    diferente++;
                }
            }

            if (diferente >= i){
                ordemPerguntas[i] = num;
            }
            else{
                i--;
            }

        }
        if(partes.length >= 6){

            String pergunta = partes[0];
            String respA = partes[ordemPerguntas[0]];
            String respB = partes[ordemPerguntas[1]];
            String respC = partes[ordemPerguntas[2]];
            String respD = partes[ordemPerguntas[3]];
            respCerta = partes[5];

            tvQuestaoNum.setText("Questao "+ (numQuestao + 1)+":");
            tvQuestaoTexto.setText(pergunta);

            btQuestao1a.setText(respA);
            btQuestao1b.setText(respB);
            btQuestao1c.setText(respC);
            btQuestao1d.setText(respD);
            /*
            btQuestao1a.setOnClickListener(v -> verificarResp(btQuestao1a.getText().toString(), btQuestao1a.getId()));
            btQuestao1b.setOnClickListener(v -> verificarResp(btQuestao1b.getText().toString(), btQuestao1b.getId()));
            btQuestao1c.setOnClickListener(v -> verificarResp(btQuestao1c.getText().toString(), btQuestao1c.getId()));
            btQuestao1d.setOnClickListener(v -> verificarResp(btQuestao1d.getText().toString(), btQuestao1d.getId()));*/
        //}
    }

    private void verificarResp(String repostaEsc){
        /*if (repostaEsc.equals(respCerta)){
            Toast.makeText(TesteSqlActivity.this, "Acertou!", Toast.LENGTH_SHORT).show();
            btVerificar.setBackgroundColor(parseColor("#80ff00"));
            btSelecionado.setBackgroundColor(parseColor("#80ff00"));

            Global.acertosSql++;
        }
        else{
            Toast.makeText(TesteSqlActivity.this, "Errou!", Toast.LENGTH_SHORT).show();

            btVerificar.setBackgroundColor(parseColor("#ff0000"));
            btSelecionado.setBackgroundColor(parseColor("#ff0000"));

            if(btQuestao1a != btSelecionado && btQuestao1a.getText().equals(respCerta)){
                btQuestao1a.setBackgroundColor(parseColor("#80ff00"));
            }
            else if(btQuestao1b != btSelecionado && btQuestao1b.getText().equals(respCerta)){
                btQuestao1b.setBackgroundColor(parseColor("#80ff00"));
            }
            else if(btQuestao1c != btSelecionado && btQuestao1c.getText().equals(respCerta)){
                btQuestao1c.setBackgroundColor(parseColor("#80ff00"));
            }
            else if(btQuestao1d != btSelecionado && btQuestao1d.getText().equals(respCerta)){
                btQuestao1d.setBackgroundColor(parseColor("#80ff00"));
            }

            Global.errosSql++;
        }
        btVerificar.setText("Próxima");*/

    }

    private void selecionarBotao(){
        if (btSelecionado != btSelecionadoAnterior){

            btQuestaoA.setBackgroundColor(parseColor("#668cff"));
            btQuestaoB.setBackgroundColor(parseColor("#668cff"));
            btQuestaoC.setBackgroundColor(parseColor("#668cff"));
            btQuestaoD.setBackgroundColor(parseColor("#668cff"));

            btSelecionado.setBackgroundColor(parseColor("#66e0ff"));

            btSelecionadoAnterior = btSelecionado;

            btVerificar.setClickable(true);
            btVerificar.setBackgroundColor(parseColor("#bfff00"));

        }
        else{
            btSelecionado.setBackgroundColor(parseColor("#668cff"));
            btSelecionadoAnterior = null;
            btVerificar.setClickable(false);
            btVerificar.setBackgroundColor(parseColor("#8E8C8C"));
        }


    }

}