create database if not exists senai_conecta character set utf8mb4 collate utf8mb4_unicode_ci;
use senai_conecta;

/*
CREATE DATABASE IF NOT EXISTS: Cria o banco somente se ele ainda não existir, evitando erro ao executar o script mais de uma vez.
CHARACTER SET utf8mb4: Define a codificação do banco, que permite acentos, caracteres especiais e emojis.
COLLATE utf8mb4_unicode_ci: Define a regra de comparação de texto, que não diferencia maiúsculas de minúsculas nem acentos nas buscas.
USE: Seleciona o banco em que as tabelas serão criadas.
*/


create table usuario (
	id_usuario int primary key auto_increment,
	nome varchar(100) not null,
	username varchar(50) not null unique,
	email varchar(100) not null unique,
	senha varchar(255) not null,
	foto varchar(255) default 'avatar.png',
	tipo_perfil enum('usuario', 'criador') default 'usuario',
	criado_em datetime default current_timestamp,
	atualizado_em datetime default current_timestamp
) engine=InnoDB;

/*
PRIMARY KEY: Identifica cada registro de forma única na tabela.
AUTO_INCREMENT: O MySQL gera o número do id automaticamente (1, 2, 3...).
NOT NULL: O campo é obrigatório, não pode ficar vazio.
UNIQUE (username e email): Não permite dois registros com o mesmo valor nesses campos.
VARCHAR(255) na senha: Tamanho grande para guardar o hash da senha, nunca a senha pura.
DEFAULT 'avatar.png': Valor padrão usado quando nenhuma foto é informada.
ENUM: O campo aceita apenas um dos valores listados ('usuario' ou 'criador'). O padrão é 'usuario'.
CURRENT_TIMESTAMP: Preenche automaticamente com a data e hora atuais do momento do cadastro.
atualizado_em: Recebe a data apenas na criação. Para atualizar a cada alteração, use ON UPDATE CURRENT_TIMESTAMP.
ENGINE=InnoDB: Motor de armazenamento que suporta chaves estrangeiras e transações.
*/


create table publicacao (
	id_publicacao int primary key auto_increment,
	id_usuario int not null,
	texto text not null,
	imagem varchar(255) null,
	datahora_publicacao datetime default current_timestamp,
	foreign key (id_usuario) references usuario(id_usuario) on delete cascade
) engine=InnoDB;
alter table publicacao add constraint fk_publicacao_usuario foreign key (id_usuario) references usuario(id_usuario);
/*ON DELETE cascade: Quando um registro da tabela pai foi excluído, os registros relacionados a tebela filha tambem serão excluídas.*/

/*
PRIMARY KEY + AUTO_INCREMENT: Identificador único da publicação, gerado automaticamente.
id_usuario: Guarda quem fez a publicação (relacionado à tabela usuario).
TEXT: Tipo para textos longos. NOT NULL: O texto é obrigatório.
NULL (imagem): O campo é opcional, a publicação pode ser feita sem imagem.
CURRENT_TIMESTAMP: Preenche automaticamente com a data e hora atuais da publicação.
FOREIGN KEY: Liga a publicação a um usuário existente, garantindo que toda publicação pertença a alguém que existe.
ON DELETE CASCADE: Quando um registro da tabela pai (usuario) for excluído, os registros relacionados na tabela filha (publicacao) também serão excluídos.
ENGINE=InnoDB: Motor de armazenamento que suporta chaves estrangeiras e transações.
*/


create table curtida (
	id_curtida int primary key auto_increment,
	id_publicacao int not null,
	id_usuario int not null,
	datahora_curtida datetime default current_timestamp,
	unique key unique_curtida (id_publicacao, id_usuario),
	foreign key (id_publicacao) references publicacao(id_publicacao) on delete cascade,
	foreign key (id_usuario) references usuario(id_usuario) on delete cascade
) engine=InnoDB;

/*
PRIMARY KEY + AUTO_INCREMENT: Identificador único da curtida, gerado automaticamente.
id_publicacao: Guarda qual publicação recebeu a curtida (relacionado à tabela publicacao).
id_usuario: Guarda qual usuário deu a curtida (relacionado à tabela usuario).
NOT NULL: Os campos são obrigatórios, toda curtida precisa ter uma publicação e um usuário.
CURRENT_TIMESTAMP: Preenche automaticamente com a data e hora atuais da curtida.
UNIQUE KEY unique_curtida (id_publicacao, id_usuario): Não permite a mesma combinação de publicação e usuário duas vezes, ou seja, o mesmo usuário não consegue curtir a mesma publicação mais de uma vez.
FOREIGN KEY (id_publicacao): Liga a curtida a uma publicação existente.
FOREIGN KEY (id_usuario): Liga a curtida a um usuário existente.
ON DELETE CASCADE: Quando um registro da tabela pai (publicacao ou usuario) for excluído, as curtidas relacionadas na tabela filha (curtida) também serão excluídas.
ENGINE=InnoDB: Motor de armazenamento que suporta chaves estrangeiras e transações.
*/



/*Para importar os dados:  Banco(ex: senai_conecta)  ---> Tables  ---> usuario(tabela para colocar o CSV)  ---> botão direito  ---> import data  ---> selecionar CSV..  ---> next  ---> verificar se o delimitador (como vírgula , ou ponto e vírgula ;) está configurado de acordo com o formato do arquivo CSV  ---> browse  ---> selecionar a pasta com os dados(CSV)  ---> ...  ---> confirmar, etc*/