var sqlite3 = require('sqlite3').verbose();
// Cria um novo banco de dados
var db = new sqlite3.Database('./BD/BD.db');

//cria tabela
db.run('CREATE TABLE IF NOT EXISTS Item (id INT NOT NULL, nome VARCHAR (20) NOT NULL, preco FLOAT NOT NULL, descricao VARCHAR (25), qtd INT NOT NULL, PRIMARY KEY (id) )');
console.log("Tabela Criada com sucesso");