var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var db = new sqlite3.Database('./BD/BD.db');


app.post('/ver', function(req,res){
    db.serialize(()=>{
    db.each('SELECT id, nome FROM Item WHERE id = ?', [req.body.id], function(err,row){
    if(err){
    res.send("Erro ao encontrar item");
    return console.error(err.message);
    }
    res.send(`<p>Id: ${row.id}</p> <p> Nome: ${row.nome}</p><hr>`);
    console.log("item encontrado");
    });
    });
    });

    //Adicionar um novo item.
    app.post('/add', function(req, res) {
        var nome = req.body.nome;
        var preco = req.body.preco;
        var desc = req.body.desc;
            // Validação dos campos obrigatórios
    if (!nome || !preco) {
        res.status(400).send('Nome e preço são campos obrigatórios.');
        return;
    }

    // Inserir o novo item no banco de dados
    var stmt = db.prepare('INSERT INTO Item (nome, Preco, Desc) VALUES (?, ?, ?)');
    stmt.run(nome, preco, desc, function(err) {
        if (err) {
            console.error(err);
            res.status(500).send('Erro ao adicionar item.');
        } else {
            res.send('Item adicionado com sucesso.');
        }
        stmt.finalize();
    });
});
// Rota para exibir a página inicial
app.all('/', function(req, res) {
    res.send('<h1>Meu Catálogo de Itens</h1>');
});
    app.listen(3000, function() {
        console.log('Servidor iniciado na porta 3000');
        });