var express = require('express');
var http = require('http');
var path = require('path');
var sqlite3 = require('sqlite3');
var app = express();
//////////////////////////////////
// definição de bibliotecas NODE do projeto

app.use(express.static(path.join(__dirname, '/css'))); // garante que os arquivos ejs consigam acessar arquivos estaticos como css
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require('cors'); // define o uso do cors pela aplicacao
app.set('view engine', 'ejs'); // Configura o mecanismo de visualização para EJS
app.set('views', path.join(__dirname, 'views')); // Define o diretório de views para o EJS
var db = new sqlite3.Database('./BD/BD.db'); // Define o diretório do banco de dados



var porta = 3333; // variavel referente a porta a ser usada
app.use(cors({
    origin: '*'
})) // indica a permissão para requisição por qualquer dominio

app.use(bodyParser.urlencoded({extended: true})) // permite passar arquivos codificados

var server = http.createServer(app);
app.get('/', function(req, res) { // get para a raiz do aplicativo
    db.all('SELECT id, nome, preco, descricao, qtd FROM Item', function(err, rows) {

        res.setHeader('Cache-Control', 'no-store, must-revalidate');
        res.setHeader('Expires', '0');//Garante que toda vez que a index for startada, o cache sera desconsiderado para exibir a pagina atualizada.
            // Itens encontrados, renderize a página de resultados da busca
            res.render('index', { items: rows });
        
    });
});



    //Adicionar um novo item.
    app.post('/add', function(req, res){
        db.serialize(() => {
            // Verificar se o ID já está cadastrado
            db.get('SELECT id FROM Item WHERE id = ?', req.body.id, function(err, row) {
                if (err) {
                    return console.error(err.message);
                }
    
                if (row) {
                    // ID já está cadastrado, renderizar página de erro
                    res.render('errorS', { message: 'ID já está cadastrado' });
                } else {
                    // ID não está cadastrado, inserir o novo item
                    if (req.body.nome.trim() != "" && req.body.preco > 0 && req.body.qtd >0 && req.body.id >0) {
                        // Validação se id, preço e quantidade são maiores que 0 e se o nome não é vazio
                        db.run('INSERT INTO Item(id, nome, preco, descricao, qtd) VALUES (?, ?, ?, ?, ?)',
                        [req.body.id, req.body.nome, req.body.preco, req.body.descricao, req.body.qtd],
                        function(err) {
                            if (err) {
                                return console.log(err.message);
                            }
    
                            res.render('add', { id: req.body.id, nome: req.body.nome, preco: req.body.preco, descricao: req.body.descricao, qtd: req.body.qtd });
                        }
                    );
                    }
                    else{
                        //renderiza pagina de erro com mensagem indicada.
                        res.render('errorS', { message: 'Nome, ID, Preço e quantidade são obrigatórios.' });
                    }

                }
            });
        });
    });
    app.post('/search', function(req, res) {
        //metodo para busca por id ou nome
        db.all('SELECT id, nome, preco, descricao, qtd FROM Item WHERE id = ? OR nome LIKE ?', [req.body.scid, '%' + req.body.scid + '%'], function(err, rows) {
            if (err) {
                res.send("Erro ao encontrar itens");
                return console.error(err.message);
            }
    
            if (!rows || rows.length == 0) {
                res.render('errorS', { message: 'Produto não encontrado' });
            } else {
                // Itens encontrados, renderize a página de resultados da busca
                res.render('search', { items: rows , id: req.body.id, nome: req.body.nome, preco: req.body.preco, descricao: req.body.descricao, qtd: req.body.qtd });
            }
        });
    });
    app.post('/alterP', function(req, res) {
        // pagina para colocar dados para alterar itens
        res.render('alterP', {id: req.body.id});
        
    });
    app.post('/alter', function(req, res) {
        // Lógica para alterar os dados do item no banco de dados
        db.serialize(()=>{
            if (req.body.nome.trim() != "" && req.body.preco > 0 && req.body.qtd >0) {//validacao se nome não é vazio
                db.run('UPDATE Item SET nome = ?, preco = ?, descricao = ?, qtd = ? WHERE id = ?',
                [req.body.nome, req.body.preco, req.body.descricao, req.body.qtd, req.body.id],
                function(err){
                    if (err){
                        return console.log(err.message);
                    }
                    res.render('alter', { id: req.body.id, nome: req.body.nome,preco: req.body.preco, descricao: req.body.descricao, qtd: req.body.qtd });
                
                        
                });
            }
            else{
                //caso os dados digitados sejam invalidos ou inexistentes, pagina de erro com mensagem indicada
                res.render('errorS', { message: 'Nome, ID, Preço e quantidade são obrigatórios.' });
            }

        });
    });

    app.post('/remove', function(req, res) {
        //remover item, nao e necessario logica para validacao de erro pois o /remove so e possivel em itens ja validados.
        db.serialize(() => {
            db.run('DELETE FROM Item WHERE id = ?', [req.body.id], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                

                db.all('SELECT id, nome FROM Item', function(err, rows) {
                    if (err) {
                        console.error(err.message);
                        res.send("Erro ao encontrar itens");
                        return;
                    }

                        res.redirect('/');
                });
            });
        });
    });
// Rota para exibir a página inicial
server.listen(3333, function(){
    console.log("Server listening on port: " + porta);
});