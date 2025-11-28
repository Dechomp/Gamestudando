package com.example.gamestudando.classesDTO;

public class Tarefa {
    int id;
    String pergunta, respA, respB, respC, respD, respCerta;

    public Tarefa(int id, String pergunta, String respA, String respB, String respC, String respD, String respCerta) {
        this.id = id;
        this.pergunta = pergunta;
        this.respA = respA;
        this.respB = respB;
        this.respC = respC;
        this.respD = respD;
        this.respCerta = respCerta;
    }

    public Tarefa() {

    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getPergunta() {
        return pergunta;
    }

    public void setPergunta(String pergunta) {
        this.pergunta = pergunta;
    }

    public String getRespA() {
        return respA;
    }

    public void setRespA(String respA) {
        this.respA = respA;
    }

    public String getRespB() {
        return respB;
    }

    public void setRespB(String respB) {
        this.respB = respB;
    }

    public String getRespC() {
        return respC;
    }

    public void setRespC(String respC) {
        this.respC = respC;
    }

    public String getRespD() {
        return respD;
    }

    public void setRespD(String respD) {
        this.respD = respD;
    }

    public String getRespCerta() {
        return respCerta;
    }

    public void setRespCerta(String respCerta) {
        this.respCerta = respCerta;
    }
}
