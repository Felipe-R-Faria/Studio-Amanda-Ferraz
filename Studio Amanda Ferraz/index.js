const express = require('express');
const fileUpload = require('express-fileupload');
const { engine } = require('express-handlebars');
const mysql = require('mysql2');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // npm install cookie-parser
require('dotenv').config({ path: './js/.env' });

const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const authRoutes = require('./js/authroutes');
const pageAuthMiddleware = require('./js/pageAuthMiddleware'); // middleware de proteção

app.use(cors());
app.use('/img', express.static('./img'));
app.use('/css', express.static('./css'));
app.use('/js', express.static('./js'));
app.use('/imagem', express.static('./imagem'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // lê os cookies das requisições
app.use(fileUpload());
app.use(session({
    secret: 'segredo',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.engine('handlebars', engine({
    defaultLayout: false
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Conexão com o Banco de dados 
const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'StudioAmandaFerraz'
});

conexao.connect(function(erro){
    if(erro) throw erro;
    console.log('Conexão efetuada!');
});

// Rotas de Auth
app.use('/api/auth', authRoutes);

// ─── Rotas PÚBLICAS (não precisam de login) ───────────────────────────────────
app.get('/login', (req, res) => res.render('login'));
app.get('/forgot-password', (req, res) => res.render('ForgetPassword'));
app.get('/verify-email', (req, res) => res.render('verifyEmail'));
app.get('/reset-password', (req, res) => res.render('RefindPassword'));

app.get('/', function(req, res){
    let sql = 'SELECT * FROM tbservico';

    conexao.query(sql, function(erro, resultado){
        if(erro) throw erro;

        const cabelo = resultado.filter(servico => servico.categoria === 'cabelo');
        const cilios = resultado.filter(servico => servico.categoria === 'cilios');

        res.render('home', { cabelo, cilios });
    });
});

// ─── Rotas PROTEGIDAS (pageAuthMiddleware bloqueia quem não está logado) ──────
app.get('/dashboardhome', pageAuthMiddleware, function(req, res){
    res.render('dashboardhome');
});

app.get('/gerenciar', pageAuthMiddleware, function(req, res){
    let mensagem = req.flash('mensagem');
    res.render('gerenciar', { 
        mensagem: mensagem.length > 0 ? mensagem[0] : null 
    });
}); 

app.get('/agendar', pageAuthMiddleware, function(req, res){
    res.render('agendar');
});

app.get('/visualizar', pageAuthMiddleware, function(req, res){
    let sql = 'SELECT * FROM tbservico';

    conexao.query(sql, function(erro, resultado){
        if(erro) throw erro;
        
        let mensagem = req.flash('mensagem'); 
        res.render('visualizar', {
            servicos: resultado,
            mensagem: mensagem.length > 0 ? mensagem[0] : null 
        });
    });
});

app.post('/cadastrar', pageAuthMiddleware, function(req, res){
    let titulo = req.body.titulo;
    let valor = req.body.valor;
    let categoria = req.body.categoria;
    let descricao = req.body.descricao;
    let imagem = req.files.imagem.name;

    let sql = `INSERT INTO tbservico (nome, valor, descricao, imagem, categoria) VALUES ('${titulo}', ${valor}, '${descricao}', '${imagem}',  '${categoria}')`;

    conexao.query(sql, function(erro, resultado){
        if(erro) throw erro;
        req.files.imagem.mv(__dirname + '/imagem/' + req.files.imagem.name);
        console.log(resultado);
        req.flash('mensagem', 'Serviço cadastrado com sucesso!');
        res.redirect('/gerenciar');
    });
});

app.get('/remover/:id/:imagem', pageAuthMiddleware, function(req, res){
    let sql = `DELETE FROM tbservico WHERE id = ${req.params.id}`;
    conexao.query(sql, function(erro, resultado){
        if(erro) throw erro;
        fs.unlink(__dirname + '/imagem/' + req.params.imagem, (erro_imagem) => {
            if(erro_imagem) console.log('Falha ao remover imagem: ' + erro_imagem);
        });
        req.flash('mensagem', 'Serviço removido com sucesso!');
        res.redirect('/visualizar');
    });
});

app.get('/formularioAlterar/:id', pageAuthMiddleware, function(req, res){
    let sql = `SELECT * FROM tbservico WHERE id = ${req.params.id}`;

    conexao.query(sql, function(erro, resultado){
        if(erro) throw erro;
        res.render('formularioAlterar', {servico: resultado[0]});
    });
});

app.get('/api/stats', function(req, res) {
    const sqlServicos = 'SELECT COUNT(*) as total FROM tbservico';
    const sqlImagens  = 'SELECT COUNT(*) as total FROM tbservico WHERE imagem IS NOT NULL AND imagem != ""';
    const sqlSemana   = `
        SELECT COUNT(*) as total FROM tbservico 
        WHERE imagem IS NOT NULL AND imagem != ""
        AND id >= (SELECT COALESCE(MAX(id), 0) - 7 FROM tbservico)
    `;

    conexao.query(sqlServicos, function(erroS, resServicos) {
        if (erroS) return res.status(500).json({ erro: 'Erro ao buscar serviços' });

        conexao.query(sqlImagens, function(erroI, resImagens) {
            if (erroI) return res.status(500).json({ erro: 'Erro ao buscar imagens' });


                res.json({
                    servicos:     resServicos[0].total,
                    imagens:      resImagens[0].total,
                  
                });
            });
        });
    });

app.post('/editar', pageAuthMiddleware, function(req, res){
    let id = req.body.id;
    let titulo = req.body.titulo;
    let valor = req.body.valor;
    let descricao = req.body.descricao;
    let imagem_atual = req.body.imagem_atual;

    if (req.files && req.files.imagem) {
        let imagem = req.files.imagem;
        imagem.mv(__dirname + '/imagem/' + imagem.name);

        let sql = `UPDATE tbservico SET nome='${titulo}', valor=${valor}, descricao='${descricao}', imagem='${imagem.name}' WHERE id=${id}`;
        conexao.query(sql, function(erro) {
            if (erro) throw erro;
            req.flash('mensagem', 'Serviço editado com sucesso!'); 
            res.redirect('/visualizar');
        });
    } else {
        let sql = `UPDATE tbservico SET nome='${titulo}', valor=${valor}, descricao='${descricao}' WHERE id=${id}`;
        conexao.query(sql, function(erro) {
            if (erro) throw erro;
            req.flash('mensagem', 'Serviço editado com sucesso!'); 
            res.redirect('/visualizar');
        });
    }
});

app.listen(8081, function(){
    console.log('Servidor rodando na porta http://localhost:8081');
});
