var express = require('express');
var http = require('http');
var path = require('path');
var sqlite3 = require('sqlite3');
var app = express();
//var sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require('cors');
app.set('view engine', 'ejs'); // Configura o mecanismo de visualização para EJS
app.set('views', path.join(__dirname, 'views')); // Define o diretório de views

var db = new sqlite3.Database('./BD/BD.db');

var porta = 3333;
app.use(cors({
    origin: '*'
}))

app.use(bodyParser.urlencoded({extended: true}))

var server = http.createServer(app);
app.get('/', function(req, res){
    //Se digitarmos no navegador localhost:3333, faremos uma requisição GET
    res.sendFile(path.join(__dirname,'../A3_USABILIDADE/index.html'));

});

    //Adicionar um novo item.
    app.post('/add', function(req, res){
        //res.sendFile(path.join(__dirname,'../A3_USABILIDADE/views/add.ejs'));
        db.serialize(()=>{
            db.run('INSERT INTO Item(id, nome, preco, desc)VALUES(?, ?,?,?)',
            [req.body.id, req.body.nome, req.body.preco, req.body.desc],
            function(err){
                if (err){
                    return console.log(err.message);
                }

                res.render('add', { id: req.body.id, nome: req.body.nome });
            
                    
            });
        });
    });
    app.post('/search', function(req, res) {
        db.get('SELECT id, nome FROM Item WHERE id = ?', [req.body.scid], function(err, row) {

            if (err) {
                res.send("Erro ao encontrar item");
                return console.error(err.message);
            }
    
            if (!row) {
                res.render('errorS');
            } else {
                // Item encontrado, renderize a página de resultados da busca
                res.render('search', { id: row.id, nome: row.nome });
            }
        });
    });
    app.post('/alterP', function(req, res) {
        // Lógica para alterar os dados do item no banco de dados
        res.render('alterP', {id: req.body.id});
    });
    app.post('/alter', function(req, res) {
        // Lógica para alterar os dados do item no banco de dados
        db.serialize(()=>{
            db.run('UPDATE Item SET nome = ?, preco = ?, desc = ? WHERE id = ?',
            [req.body.nome, req.body.preco, req.body.desc, req.body.id],
            function(err){
                if (err){
                    return console.log(err.message);
                }
    
                res.render('alter', { id: req.body.id, nome: req.body.nome });
            
                    
            });
        });
    });

    app.post('/remove', function(req, res) {
        db.serialize(()=>{
            db.run('DELETE FROM Item WHERE id = ?', [req.body.id], function(err) {
                if (err){
                    return console.log(err.message);
                }
                res.sendFile(path.join(__dirname,'../A3_USABILIDADE/index.html'));
            });
        });
    });
// Rota para exibir a página inicial
server.listen(3333, function(){
    console.log("Server listening on port: " + porta);
});