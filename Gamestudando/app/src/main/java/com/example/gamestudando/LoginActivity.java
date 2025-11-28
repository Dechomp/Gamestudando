package com.example.gamestudando;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.firebase.auth.FirebaseAuth;

public class LoginActivity extends AppCompatActivity {

    Button btLogar, btCadastrarLogin, btSobreNos;

    EditText edUsuarioLogar, edSenhaLogar;


    //Autenticador de FireBase
    FirebaseAuth mAuth = FirebaseAuth.getInstance();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_login);


        //Vinculando os componentes
        btLogar = findViewById(R.id.btLogar);
        btCadastrarLogin = findViewById(R.id.btCadastrarLogin);
        btSobreNos = findViewById(R.id.btSobreNos);

        edUsuarioLogar = findViewById(R.id.edUsuarioLogar);
        edSenhaLogar = findViewById(R.id.edSenhaLogar);



        btCadastrarLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent telaCadastro;

                telaCadastro = new Intent(LoginActivity.this, EscolherCadastroActivity.class);
                startActivity(telaCadastro);

            }
        });

        btLogar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (edUsuarioLogar.getText().toString().isEmpty() || edSenhaLogar.getText().toString().isEmpty()) {
                    Toast.makeText(LoginActivity.this, "Preencha todos os campos", Toast.LENGTH_SHORT).show();
                }
                else{
                    mAuth.signInWithEmailAndPassword(edUsuarioLogar.getText().toString(), edSenhaLogar.getText().toString())
                            .addOnCompleteListener(task -> {
                                if (task.isSuccessful()){
                                    Toast.makeText(LoginActivity.this, "Usuário logado com sucesso!", Toast.LENGTH_SHORT).show();
                                    Log.d("FIREBASE", "Usuário logado com sucesso!");

                                    //Mando para a tela que eu quero
                                    Global.navegarTela(v, MenuEscolhaActivity.class);

                                }
                                else{
                                    Toast.makeText(LoginActivity.this, "Erro no login: " + task.getException(), Toast.LENGTH_LONG).show();
                                    Log.e("FIREBASE", "Erro no login", task.getException());
                                }
                            }
                    );
                }
            }
        });

        btSobreNos.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Global.navegarTela(v, SobreActivity.class);
            }
        });

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}