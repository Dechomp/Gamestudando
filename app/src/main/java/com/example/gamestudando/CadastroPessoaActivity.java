package com.example.gamestudando;

import android.app.DatePickerDialog;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.firebase.auth.FirebaseAuth;

import java.util.Calendar;

public class CadastroPessoaActivity extends AppCompatActivity {

    EditText edNome, edEmail, edTelefone, edDataNasc, edSenha, edConfirmarSenha, edCPF;
    CheckBox cbMostrarSenha;

    Button btCadastrar, btEscolherData;

    //Autenticador de FireBase
    FirebaseAuth mAuth = FirebaseAuth.getInstance();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_cadastro_pessoa);

        //Relacionando elementos
        edNome = findViewById(R.id.edCadastrarNome);
        edCPF = findViewById(R.id.edCadastrarCPF);
        edEmail = findViewById(R.id.edCadastrarEmail);
        edTelefone = findViewById(R.id.edCadastrarTelefone);
        edDataNasc = findViewById(R.id.edCadastrarData);
        edSenha = findViewById(R.id.edCadastrarSenha);
        edConfirmarSenha = findViewById(R.id.edCadastrarConfirmarSenha);

        cbMostrarSenha = findViewById(R.id.cbMostrarSenha);

        btCadastrar = findViewById(R.id.btCadastrarPessoa);
        btEscolherData = findViewById(R.id.btEscolherData);






        btEscolherData.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Calendar calendario = Calendar.getInstance();

                //Crio uma variável para cada informação de data
                int dia, mes, ano;

                //Cada uma recebe o tipo da informação
                dia = calendario.get(Calendar.DAY_OF_MONTH);
                mes = calendario.get(Calendar.MONTH);
                ano = calendario.get(Calendar.YEAR);

                DatePickerDialog escolherDataNascimento = new DatePickerDialog(
                        //Tela atual
                        CadastroPessoaActivity.this,

                        //Parâmetros de data
                        (view, year, month, dayOfMonth) -> {

                            //Formata a data
                            Calendar dataEscolhida = Calendar.getInstance();

                            dataEscolhida.set(ano, mes, dia);

                            if (year < 1900 || year > ano) {
                                Toast.makeText(CadastroPessoaActivity.this, "Ano inválido, Escolha Novamente", Toast.LENGTH_SHORT).show();
                                edDataNasc.setText("");
                            } else if (year > ano - 18 || (year == ano - 18 && month > mes) || (year == ano - 18 && month == mes && dayOfMonth > dia)) {
                                Toast.makeText(CadastroPessoaActivity.this, "Você deve ter mais de 18 anos para se cadastrar", Toast.LENGTH_SHORT).show();
                                edDataNasc.setText("");
                            } else {
                                //Adiciona a data no EditText
                                edDataNasc.setText(dayOfMonth + "/" + (month + 1) + "/" + year);
                            }

                        },
                        //Relacionadas ao calendário
                        ano, mes, dia
                );

                //Bloqueia as datas no futuro
                escolherDataNascimento.getDatePicker().setMaxDate(System.currentTimeMillis());

                //Mostra o calendário
                escolherDataNascimento.show();
            }
        });
        //Quando clicar na data de nascimento, abre um calendário


        btCadastrar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                mAuth.createUserWithEmailAndPassword(edEmail.getText().toString(), edSenha.getText().toString())
                        .addOnCompleteListener(task -> {
                            if (task.isSuccessful()){
                                Toast.makeText(CadastroPessoaActivity.this, "Usuário cadastrado com sucesso!", Toast.LENGTH_SHORT).show();
                                Log.d("FIREBASE", "Usuário cadastrado com sucesso!");

                                finish();

                            }
                            else {
                                Toast.makeText(CadastroPessoaActivity.this, "Erro no login: " + task.getException(), Toast.LENGTH_LONG).show();
                                Log.e("FIREBASE", "Erro no login", task.getException());
                                edNome.setText(task.getException().toString());
                            }
                });

            }
        });


        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}