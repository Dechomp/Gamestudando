package com.example.gamestudando.classesDAO;


import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import androidx.annotation.Nullable;

import com.example.gamestudando.Global;

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
                COLUNA_RESPCERTA   + " TEXT NOT NULL )"
        );
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {

    }
}
