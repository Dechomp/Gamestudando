-- drop DATABASE dbGamestudando;
CREATE DATABASE dbGamestudando;
use dbGamestudando;


CREATE TABLE Responsavel (
    res_id VARCHAR(14) PRIMARY KEY,
    res_nome VARCHAR(50),
    res_cpf VARCHAR(14),
    res_dataNascimento DATE,
    res_telefone VARCHAR(15),
    res_email VARCHAR(50),
    res_isVerificado BOOLEAN,
    res_senhaHash VARCHAR(16),
    res_dataCadastro DATE,
    res_status VARCHAR(14),
    UNIQUE (res_email, res_telefone, res_cpf)
);

CREATE TABLE Estudante (
    est_id VARCHAR(14) PRIMARY KEY,
    est_nome VARCHAR(50),
    est_cpf VARCHAR(14),
    est_dataNascimento DATE,
    est_email VARCHAR(50),
    est_senhaHash VARCHAR(16),
    est_dataCadastro DATE,
    est_telefone VARCHAR(15),
    est_status VARCHAR(14),
    est_isVerificado BOOLEAN,
    res_id VARCHAR(14),
    UNIQUE (est_cpf, est_telefone, est_email),
    FOREIGN KEY (res_id)   REFERENCES Responsavel (res_id)
);


CREATE TABLE Escola (
    esc_id VARCHAR(14) PRIMARY KEY,
    esc_nome VARCHAR(50),
    esc_cnpj VARCHAR(20),
    esc_email VARCHAR(50),
    esc_status VARCHAR(14),
    esc_telefone VARCHAR(15),
    esc_isVerificado BOOLEAN,
    esc_senhaHash VARCHAR(16),
    esc_dataCadastro DATE,
    esc_status VARCHAR(14),
    UNIQUE (esc_cnpj, esc_email)    
);

CREATE TABLE Professor (
    pro_id VARCHAR(14) PRIMARY KEY,
    pro_nome VARCHAR(50),
    pro_cpf VARCHAR(14),
    pro_email VARCHAR(50),
    pro_senhaHash VARCHAR(16),
    pro_telefone VARCHAR(14),
    pro_formacao VARCHAR(100),
    pro_status VARCHAR(14),
    pro_dataCadastro DATE,
    pro_isVerificado BOOLEAN,
    UNIQUE (pro_cpf, pro_email, pro_telefone)
);

CREATE TABLE Turma (
    tur_id VARCHAR(14) PRIMARY KEY,
    tur_nome VARCHAR(14),
    tur_codigo VARCHAR(10) UNIQUE,
    tur_dataInicio DATE,
    pro_id VARCHAR(14),
    FOREIGN KEY (pro_id) REFERENCES Professor (pro_id)
);

CREATE TABLE Disciplina (
    dis_id VARCHAR(14) PRIMARY KEY,
    dis_nome VARCHAR(20) UNIQUE,
    dis_descricao VARCHAR(100)
);

CREATE TABLE Matricula (
    mat_id VARCHAR(14) PRIMARY KEY,
    mat_dataMatricula DATE,
    mat_status VARCHAR(14),
    mat_nota DECIMAL(4,2),
    est_id VARCHAR(14),
    tur_id VARCHAR(14),
    FOREIGN KEY (est_id) REFERENCES Estudante (est_id),
    FOREIGN KEY (tur_id) REFERENCES Turma (tur_id)
);

CREATE TABLE ProfDisciplina (
    pdc_id VARCHAR(14) PRIMARY KEY,
    pdc_status VARCHAR(14),
    pro_id VARCHAR(14),
    dis_id VARCHAR(14),
    FOREIGN KEY (pro_id) REFERENCES Professor (pro_id),
    FOREIGN KEY (dis_id) REFERENCES Disciplina (dis_id)
);

CREATE TABLE ContratoEscola (
    ctr_id VARCHAR(14) PRIMARY KEY,
    ctr_dataContrato DATE,
    ctr_cargo VARCHAR(50),
    ctr_status VARCHAR(14),
    pro_id VARCHAR(14),
    esc_id VARCHAR(14),
    FOREIGN KEY (pro_id) REFERENCES Professor (pro_id),
    FOREIGN KEY (esc_id) REFERENCES Escola(esc_id)
);

CREATE TABLE Atividades (
    atv_id VARCHAR(14) PRIMARY KEY,
    atv_titulo VARCHAR(100),
    atv_descricao VARCHAR(200),
    atv_tipo VARCHAR(25),
    atv_dataCriacao DATE,
    atv_dataEntrega DATE,
    atv_pontuacaoMax DECIMAL(4,2),
    atv_peso DECIMAL(4,2),
    atv_status VARCHAR(14),
    atv_arquivoRelacionado BLOB,
    tur_id VARCHAR(14),
    dis_id VARCHAR(14),
    FOREIGN KEY (tur_id) REFERENCES Turma (tur_id),
    FOREIGN KEY (dis_id) REFERENCES Disciplina (dis_id)
);

CREATE TABLE EntregaAtividade (
    ent_id VARCHAR(14) PRIMARY KEY,
    ent_dataEntrega DATE,
    ent_pontuacao DECIMAL(4,2),
    ent_comentario VARCHAR(100),
    ent_anexo BLOB,
    ent_status VARCHAR(14),
    est_id VARCHAR(14),
    atv_id VARCHAR(14),
    FOREIGN KEY (est_id) REFERENCES Estudante (est_id),
    FOREIGN KEY (atv_id) REFERENCES Atividades (atv_id)
);