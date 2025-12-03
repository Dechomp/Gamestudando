package com.example.gamestudando.classesDAO;


import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import androidx.annotation.Nullable;

import com.example.gamestudando.Global;
import com.example.gamestudando.classesDTO.Tarefa;

import java.util.ArrayList;

public class TarefaDAO extends SQLiteOpenHelper {
    //Crio componentes para o banco de dados
    public static final String NOME_BANCO = "dbGamestudando";
    public static final int VERSAO = Global.versao;
    public static final String NOME_TABELA = "tarefa";
    public static final String COLUNA_ID = "tar_id";
    public static final String COLUNA_PERGUNTA = "tar_pergunta";
    public static final String COLUNA_RESPA = "tar_respA";
    public static final String COLUNA_RESPB = "tar_respB";
    public static final String COLUNA_RESPC = "tar_respC";
    public static final String COLUNA_RESPD = "tar_respD";
    public static final String COLUNA_RESPCERTA = "tar_respCerta";
    public static final String COLUNA_MATERIA = "tar_materia";
    public static final String COLUNA_PROFESSORID = "pro_id";


    //Construtor
    public TarefaDAO(@Nullable Context context) {
        super(context, NOME_BANCO, null, VERSAO);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        //Quando o banco for criado
        //Simula uma tabela SQL
        // excSQL executa uma criação de tabela
        db.execSQL("CREATE TABLE " + NOME_TABELA + "(" +
                COLUNA_ID      + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COLUNA_PERGUNTA    + " TEXT NOT NULL, " +
                COLUNA_RESPA   + " TEXT NOT NULL, " +
                COLUNA_RESPB   + " TEXT NOT NULL, " +
                COLUNA_RESPC   + " TEXT NOT NULL, " +
                COLUNA_RESPD   + " TEXT NOT NULL, " +
                COLUNA_RESPCERTA   + " TEXT NOT NULL, " +
                COLUNA_MATERIA   + " TEXT NOT NULL," +
                COLUNA_PROFESSORID   + " TEXT NOT NULL )"
        );

        db.execSQL("CREATE TABLE tarefaEntregue(" +
                "ent_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "tar_id INTEGER NOT NULL, " +
                "est_id INTEGER NOT NULL, " +
                "ent_data DATE NOT NULL," +
                "ent_acertou INTEGER NOT NULL)" // 0 ou 1
        );
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {

    }

    //C de Create

    //Função para criar uma tarefa
    public void criarTarefa(Tarefa tarefa){
        //Abre a conexão
        SQLiteDatabase db = this.getWritableDatabase();

        //Crio a variável para receber os valores
        ContentValues valores = new ContentValues();

        //Adiociono os valores
        valores.put(COLUNA_PERGUNTA, tarefa.getPergunta());
        valores.put(COLUNA_RESPA, tarefa.getRespA());
        valores.put(COLUNA_RESPB, tarefa.getRespB());
        valores.put(COLUNA_RESPC, tarefa.getRespC());
        valores.put(COLUNA_RESPD, tarefa.getRespD());
        valores.put(COLUNA_RESPCERTA, tarefa.getRespCerta());
        valores.put(COLUNA_MATERIA, tarefa.getMateria());
        valores.put(COLUNA_PROFESSORID, tarefa.getIdProfessor());

        //Insere os valores no banco
        db.insert(NOME_TABELA, null, valores);

        //Fecho a conexão
        db.close();
    }

    //R de read
    //Buscar uma tarefa
    public Tarefa buscarTarefa(int id){
        //Crio uma tarefa vazia
        Tarefa tarefa = new Tarefa();

        //Crio o parâmetro de consulta
        String parametro[] = {String.valueOf(id)};

        //Falo quais campos eu quero
        String campos[] = {COLUNA_ID, COLUNA_PERGUNTA, COLUNA_RESPA, COLUNA_RESPB, COLUNA_RESPC, COLUNA_RESPD, COLUNA_RESPCERTA, COLUNA_MATERIA, COLUNA_PROFESSORID};

        //Abre a conexão
        SQLiteDatabase db = this.getReadableDatabase();

        //Crio o cursor para o select
        Cursor cursor = db.query(
                //Tabela (FROM)
                NOME_TABELA,
                //Dados (SELECT)
                campos,
                //Condição (WHERE)
                COLUNA_ID + " = ?",
                //Parâmetro no lugar do "?"
                parametro,
                //Outros (Group by, having, order by"
                null,
                null,
                null
        );

        if (cursor.moveToFirst()){
            tarefa = new Tarefa(
                    cursor.getInt(0),
                    cursor.getString(1),
                    cursor.getString(2),
                    cursor.getString(3),
                    cursor.getString(4),
                    cursor.getString(5),
                    cursor.getString(6),
                    cursor.getString(7),
                    cursor.getString(8)
            );
        }

        //Fecho a conexão
        db.close();

        //Retorno a tarefa
        return tarefa;
    }

    //Buscar uma lista de tarefas por tipo da materia
    public ArrayList<Tarefa> listarTarefas(String materia){
        //Crio um tarefa vazio
        Tarefa tarefa = null;


        //Crio uma lista vazia
        ArrayList<Tarefa> tarefas = new ArrayList<>();

        //Crio os parâmetros
        String parametro[] = {String.valueOf(materia)};

        //Quais dados quero receber
        String campos[] = {COLUNA_ID, COLUNA_PERGUNTA, COLUNA_RESPA, COLUNA_RESPB, COLUNA_RESPC, COLUNA_RESPD, COLUNA_RESPCERTA, COLUNA_MATERIA, COLUNA_PROFESSORID};


        //Conecto ao banco
        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = null;

        try{
            //Crio o cursor e faço o select
            cursor = db.query(
                    //Tabela (FROM)
                    NOME_TABELA,
                    //Dados (SELECT)
                    campos,
                    //Condição (WHERE)
                    COLUNA_MATERIA + " = ?",
                    //Parâmetro no lugar do "?"
                    parametro,
                    //Outros (Group by, having, order by"
                    null,
                    null,
                    null
            );
        }
        catch (Exception ex){
            Log.e("Erro do cursor: ", ex.getMessage());
        }

        //Se der certo, haverá como mover para a próxima linha
        while (cursor.moveToNext()){
            //Recebo a tarefa
            tarefa = new Tarefa(
                    cursor.getInt(0),
                    cursor.getString(1),
                    cursor.getString(2),
                    cursor.getString(3),
                    cursor.getString(4),
                    cursor.getString(5),
                    cursor.getString(6),
                    cursor.getString(7),
                    cursor.getString(8)
            );

            //Adiciono a lista
            tarefas.add(tarefa);
        }

        //Fecha a conexão
        db.close();

        //Retorna a lista
        return tarefas;
    }

    //Buscar uma lista de tarefas por id do professor
    public ArrayList<Tarefa> listarTarefasProfessor(String materia){
        //Crio um tarefa vazio
        Tarefa tarefa = null;


        //Crio uma lista vazia
        ArrayList<Tarefa> tarefas = new ArrayList<>();

        //Crio os parâmetros
        String parametro[] = {String.valueOf(materia)};

        //Quais dados quero receber
        String campos[] = {COLUNA_ID, COLUNA_PERGUNTA, COLUNA_RESPA, COLUNA_RESPB, COLUNA_RESPC, COLUNA_RESPD, COLUNA_RESPCERTA, COLUNA_MATERIA, COLUNA_PROFESSORID};


        //Conecto ao banco
        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = null;

        try{
            //Crio o cursor e faço o select
            cursor = db.query(
                    //Tabela (FROM)
                    NOME_TABELA,
                    //Dados (SELECT)
                    campos,
                    //Condição (WHERE)
                    COLUNA_PROFESSORID + " = ?",
                    //Parâmetro no lugar do "?"
                    parametro,
                    //Outros (Group by, having, order by"
                    null,
                    null,
                    null
            );
        }
        catch (Exception ex){
            Log.e("Erro do cursor: ", ex.getMessage());
        }

        //Se der certo, haverá como mover para a próxima linha
        while (cursor.moveToNext()){
            //Recebo a tarefa
            tarefa = new Tarefa(
                    cursor.getInt(0),
                    cursor.getString(1),
                    cursor.getString(2),
                    cursor.getString(3),
                    cursor.getString(4),
                    cursor.getString(5),
                    cursor.getString(6),
                    cursor.getString(7),
                    cursor.getString(8)
            );

            //Adiciono a lista
            tarefas.add(tarefa);
        }

        //Fecha a conexão
        db.close();

        //Retorna a lista
        return tarefas;
    }

    //U de update
    public void atualizarTarefa(Tarefa tarefa) {
        //Abre a conexão
        SQLiteDatabase db = this.getWritableDatabase();

        //Crio a variável para receber os valores
        ContentValues valores = new ContentValues();

        //Adiciono os valores
        valores.put(COLUNA_PERGUNTA, tarefa.getPergunta());
        valores.put(COLUNA_RESPA, tarefa.getRespA());
        valores.put(COLUNA_RESPB, tarefa.getRespB());
        valores.put(COLUNA_RESPC, tarefa.getRespC());
        valores.put(COLUNA_RESPD, tarefa.getRespD());
        valores.put(COLUNA_RESPCERTA, tarefa.getRespCerta());
        valores.put(COLUNA_MATERIA, tarefa.getMateria());
        valores.put(COLUNA_PROFESSORID, tarefa.getIdProfessor());

        //Parâmetro
        String parametro[] = {String.valueOf(tarefa.getId())};

        //Atualizo os dados
        db.update(
                //Nome da tabela (UPDATE)
                NOME_TABELA,

                //SET valores a serem alterados
                valores,

                //WHERE (Condição)
                COLUNA_ID + " = ?",

                //Valor que vai no lugar do "?"
                parametro);

        //Fecha a conexão
        db.close();
    }

    //D de Delete
    public void excluirContato(int id){
        //Abre a conexão
        SQLiteDatabase db = this.getWritableDatabase();

        //Cria os parâmetros
        String parametro[] = {String.valueOf(id)};

        //Manda deletar o contato
        db.delete(
                //Nome da tabela
                NOME_TABELA,

                //Condição
                COLUNA_ID + " = ?",

                //Parâmetro
                parametro
        );

        //Fecha a conexão
        db.close();
    }


}
