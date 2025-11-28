package com.example.gamestudando;

import android.os.Bundle;
import android.widget.TextView;
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

public class PerfilAlunoActivity extends AppCompatActivity {

    //Crio os elementos
    TextView tvNome, tvEmail, tvDataNascimento;

    //Crio o banco de dados
    FirebaseFirestore db;

    FirebaseUser user = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_perfil_aluno);

        //Vinculo os componenetes
        tvNome = findViewById(R.id.tvNome);
        tvEmail = findViewById(R.id.tvEmail);
        tvDataNascimento = findViewById(R.id.tvDataNascimento);

        //Chamo o banco de dados e pega o usuário logado
        db = FirebaseFirestore.getInstance();

        //Recebe o usuário logado
        user = FirebaseAuth.getInstance().getCurrentUser();

        carregarEstudante();

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    //Carregar estudantes
    private void carregarEstudante() {
        //Pega os dados do usuário logado
        db.collection("Estudante")
                //Procuro pelo id do usuário logado
                .document(user.getUid())
                //Pego os dados do estudante
                .get()
                //Caso de certo
                .addOnSuccessListener(doc -> {
                    //Caso não venha vazio
                    if (doc.exists()) {
                        //Pego as informações do estudante
                        Estudante estudante = doc.toObject(Estudante.class);

                        //Defino os textos
                        tvNome.setText(estudante.getNome());
                        tvEmail.setText(estudante.getEmail());
                        tvDataNascimento.setText(estudante.getDataNascimento() + "");

                    }
                    //Se não tiver nenhum estudante
                    else {
                        //Mostro a mensagem
                        Toast.makeText(this, "Usuário não encontrado", Toast.LENGTH_SHORT).show();
                    }
                })
                //Se der erraado
                .addOnFailureListener(e ->{
                    //Mostro a mensagem de erro
                    Toast.makeText(this, "Erro ao buscar o estudante", Toast.LENGTH_SHORT).show();
                });

    }
}