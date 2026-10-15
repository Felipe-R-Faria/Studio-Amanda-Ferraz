const express = require('express');
const fileUpload = require('express-fileupload');
const { engine } = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

const { conexao } = require('./js/db');
const authRoutes = require('./js/authroutes');
const pageAuthMiddleware = require('./js/pageAuthMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Garantir diretório de uploads
const imagemDir = path.join(__dirname, 'imagem');
if (!fs.existsSync(imagemDir)) {
    fs.mkdirSync(imagemDir, { recursive: true });
}

app.use(cors());
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/imagem', express.static(path.join(__dirname, 'imagem')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 }
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'studio_amanda_ferraz_session_secret',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.engine('handlebars', engine({
    defaultLayout: false
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Conexão com o Banco de dados
conexao.connect(function(erro){
    if(erro) {
        console.error('Erro na conexão com banco:', erro.message);
    } else {
        console.log('Conexão efetuada com sucesso!');
    }
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
        if(erro) {
            console.error('Erro ao buscar serviços:', erro);
            resultado = [];
        }

        const servicos = resultado || [];
        const cabelo = servicos.filter(servico => servico.categoria === 'cabelo');
        const cilios = servicos.filter(servico => servico.categoria === 'cilios');

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

app.get('/agendar', function(req, res){
    // Rota de agendamento acessível aos clientes do site
    res.render('agendar');
});

app.get('/visualizar', pageAuthMiddleware, function(req, res){
    let sql = 'SELECT * FROM tbservico';

    conexao.query(sql, function(erro, resultado){
        if(erro) {
            console.error('Erro ao carregar serviços:', erro);
            resultado = [];
        }
        
        let mensagem = req.flash('mensagem'); 
        res.render('visualizar', {
            servicos: resultado || [],
            mensagem: mensagem.length > 0 ? mensagem[0] : null 
        });
    });
});

app.post('/cadastrar', pageAuthMiddleware, function(req, res){
    let titulo = req.body.titulo || 'Novo Serviço';
    let valor = parseFloat(req.body.valor) || 0;
    let categoria = req.body.categoria || 'cabelo';
    let descricao = req.body.descricao || '';
    let imagemNome = '';

    if (req.files && req.files.imagem) {
        imagemNome = req.files.imagem.name;
        req.files.imagem.mv(path.join(imagemDir, imagemNome), (err) => {
            if (err) console.error('Erro ao mover imagem enviada:', err);
        });
    }

    let sql = `INSERT INTO tbservico (nome, valor, descricao, imagem, categoria) VALUES ('${titulo}', ${valor}, '${descricao}', '${imagemNome}', '${categoria}')`;

    conexao.query(sql, function(erro, resultado){
        if(erro) {
            console.error('Erro ao inserir serviço:', erro);
            req.flash('mensagem', 'Erro ao cadastrar serviço.');
            return res.redirect('/gerenciar');
        }
        req.flash('mensagem', 'Serviço cadastrado com sucesso!');
        res.redirect('/visualizar');
    });
});

app.get('/remover/:id/:imagem', pageAuthMiddleware, function(req, res){
    let id = parseInt(req.params.id, 10);
    let sql = `DELETE FROM tbservico WHERE id = ${id}`;
    conexao.query(sql, function(erro, resultado){
        if(erro) {
            console.error('Erro ao remover serviço:', erro);
        }
        if (req.params.imagem && req.params.imagem !== 'null' && req.params.imagem !== 'undefined') {
            const imgPath = path.join(imagemDir, req.params.imagem);
            if (fs.existsSync(imgPath)) {
                fs.unlink(imgPath, (erro_imagem) => {
                    if(erro_imagem) console.log('Falha ao remover imagem: ' + erro_imagem);
                });
            }
        }
        req.flash('mensagem', 'Serviço removido com sucesso!');
        res.redirect('/visualizar');
    });
});

app.get('/formularioAlterar/:id', pageAuthMiddleware, function(req, res){
    let id = parseInt(req.params.id, 10);
    let sql = `SELECT * FROM tbservico WHERE id = ${id}`;

    conexao.query(sql, function(erro, resultado){
        if(erro || !resultado || resultado.length === 0) {
            return res.redirect('/visualizar');
        }
        res.render('formularioAlterar', { servico: resultado[0] });
    });
});

app.get('/api/stats', function(req, res) {
    const sqlServicos = 'SELECT COUNT(*) as total FROM tbservico';
    const sqlImagens  = 'SELECT COUNT(*) as total FROM tbservico WHERE imagem IS NOT NULL AND imagem != ""';

    conexao.query(sqlServicos, function(erroS, resServicos) {
        if (erroS) return res.status(500).json({ erro: 'Erro ao buscar serviços' });

        conexao.query(sqlImagens, function(erroI, resImagens) {
            if (erroI) return res.status(500).json({ erro: 'Erro ao buscar imagens' });

            const totalServicos = resServicos && resServicos[0] ? resServicos[0].total : 0;
            const totalImagens  = resImagens && resImagens[0] ? resImagens[0].total : 0;

            res.json({
                servicos: totalServicos,
                imagens: totalImagens,
                novasSemana: totalImagens
            });
        });
    });
});

app.post('/editar', pageAuthMiddleware, function(req, res){
    let id = parseInt(req.body.id, 10);
    let titulo = req.body.titulo || '';
    let valor = parseFloat(req.body.valor) || 0;
    let descricao = req.body.descricao || '';

    if (req.files && req.files.imagem) {
        let imagem = req.files.imagem;
        imagem.mv(path.join(imagemDir, imagem.name), (err) => {
            if (err) console.error('Erro ao salvar imagem editada:', err);
        });

        let sql = `UPDATE tbservico SET nome='${titulo}', valor=${valor}, descricao='${descricao}', imagem='${imagem.name}' WHERE id=${id}`;
        conexao.query(sql, function(erro) {
            if (erro) console.error('Erro ao atualizar serviço:', erro);
            req.flash('mensagem', 'Serviço editado com sucesso!'); 
            res.redirect('/visualizar');
        });
    } else {
        let sql = `UPDATE tbservico SET nome='${titulo}', valor=${valor}, descricao='${descricao}' WHERE id=${id}`;
        conexao.query(sql, function(erro) {
            if (erro) console.error('Erro ao atualizar serviço:', erro);
            req.flash('mensagem', 'Serviço editado com sucesso!'); 
            res.redirect('/visualizar');
        });
    }
});

app.listen(PORT, '0.0.0.0', function(){
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
