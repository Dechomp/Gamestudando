package com.example.gamestudando.classesDTO;

public class Tarefa {
    int id;
    String pergunta, respA, respB, respC, respD, respCerta, materia, idProfessor;

    public Tarefa(int id, String pergunta, String respA, String respB, String respC, String respD, String respCerta, String materia, String idProfessor) {
        this.id = id;
        this.pergunta = pergunta;
        this.respA = respA;
        this.respB = respB;
        this.respC = respC;
        this.respD = respD;
        this.respCerta = respCerta;
        this.materia = materia;
        this.idProfessor = idProfessor;
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

    public String getMateria() {
        return materia;
    }

    public void setMateria(String materia) {
        this.materia = materia;
    }

    public String getIdProfessor() {
        return idProfessor;
    }

    public void setIdProfessor(String idProfessor) {
        this.idProfessor = idProfessor;
    }
}
