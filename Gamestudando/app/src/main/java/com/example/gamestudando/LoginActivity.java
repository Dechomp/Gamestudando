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

import com.example.gamestudando.classesDTO.Estudante;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.FirebaseFirestore;

public class LoginActivity extends AppCompatActivity {

    Button btLogar, btCadastrarLogin, btSobreNos;

    EditText edUsuarioLogar, edSenhaLogar;

    //Variável para ver o tipo do usuário caso ache ou não
    boolean usuarioAchado = false;

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
                                    FirebaseFirestore db;

                                    FirebaseUser user = null;

                                    //Chamo o banco de dados e pega o usuário logado
                                    db = FirebaseFirestore.getInstance();

                                    //Recebe o usuário logado
                                    user = FirebaseAuth.getInstance().getCurrentUser();

                                    db.collection("Estudante")
                                            //Procuro pelo id do usuário logado
                                            .document(user.getUid())
                                            //Pego os dados do estudante
                                            .get()
                                            //Caso de certo
                                            .addOnSuccessListener(doc -> {
                                                //Caso exista
                                                if (doc.exists()) {
                                                    //Mando para a tela de escolha de teste
                                                    Global.navegarTela(v, MenuEscolhaActivity.class);

                                                    usuarioAchado = true;
                                                }
                                            })
                                            //Se der erraado
                                            .addOnFailureListener(e ->{
                                                //Mostro a mensagem de erro
                                               // Toast.makeText(this, "Erro ao buscar o estudante", Toast.LENGTH_SHORT).show();
                                            });

                                    if (!usuarioAchado){
                                        //Testo para ver se é um professor
                                        db.collection("Professor")
                                                //Procuro pelo id do usuário logado
                                                .document(user.getUid())
                                                //Pego os dados do professor
                                                .get()
                                                //Caso de certo
                                                .addOnSuccessListener(doc -> {
                                                    //Caso exista
                                                    if (doc.exists()) {
                                                        //Mando para a tela de escolha de teste
                                                        Global.navegarTela(v, MainProfessorActivity.class);

                                                        usuarioAchado = true;
                                                    }
                                                })
                                                //Se der erraado
                                                .addOnFailureListener(e ->{
                                                    //Mostro a mensagem de erro
                                                    // Toast.makeText(this, "Erro ao buscar o estudante", Toast.LENGTH_SHORT).show();
                                                });
                                    }

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