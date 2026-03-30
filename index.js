const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());

// --- CONFIGURAÇÃO DE CAMINHOS ---
const BANCO_DADOS = {
    usuario: path.join(__dirname, 'usuario.json'),
    produtos: path.join(__dirname, 'produtos.json')
};

// --- FUNÇÕES AUXILIARES UNIVERSAIS ---

// Lê qualquer arquivo JSON baseado na chave (clientes ou produtos)
function lerDados(tipo) {
    try {
        const arquivo = BANCO_DADOS[tipo];
        if (!fs.existsSync(arquivo)) return [];
        const dados = fs.readFileSync(arquivo, 'utf8');
        return JSON.parse(dados || '[]');
    } catch (e) {
        console.error(`Erro ao ler ${tipo}:`, e);
        return [];
    }
}

// Salva qualquer array no arquivo correspondente
function salvarDados(tipo, objeto) {
    try {
        const arquivo = BANCO_DADOS[tipo];
        fs.writeFileSync(arquivo, JSON.stringify(objeto, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error(`Erro ao salvar ${tipo}:`, e);
        return false;
    }
}

// --- ROTAS DE USUARIO ---

app.get('/usuario', (req, res) => {
    res.json(lerDados('usuario'));
});

app.post('/usuario', (req, res) => {
    const { codigo, nome, email, senha } = req.body;

    if (!codigo || !nome || !email || !senha) {
        return res.status(400).json({ error: 'Dados essenciais faltando (Código, Nome, Email, Senha)' });
    }

    const usuarios = lerDados('usuario');
    if (usuarios.some(u => String(u.codigo) === String(codigo))) {
        return res.status(400).json({ error: 'Este código já está cadastrado.' });
    }

    const novoUsuario = { 
        codigo: String(codigo), 
        nome, 
        email, 
        senha 
    };

    usuarios.push(novoUsuario);
    if (salvarDados('usuario', usuarios)) {
        res.status(201).json({ mensagem: 'Usuário cadastrado!', usuario: novoUsuario });
    } else {
        res.status(500).json({ error: 'Erro ao salvar usuário.' });
    }
});

// --- ROTAS DE PRODUTOS ---

app.get('/produtos', (req, res) => {
    res.json(lerDados('produtos'));
});

app.post('/produtos', (req, res) => {
    const { id, nome, preco, estoque } = req.body;

    if (!id || !nome || !preco) {
        return res.status(400).json({ error: 'Dados essenciais faltando (ID, Nome, Preço)' });
    }

    const produtos = lerDados('produtos');
    if (produtos.some(p => String(p.id) === String(id))) {
        return res.status(400).json({ error: 'Este ID de produto já existe.' });
    }

    const novoProduto = { 
        id: String(id), 
        nome, 
        preco: Number(preco), 
        estoque: Number(estoque) || 0 
    };

    produtos.push(novoProduto);
    if (salvarDados('produtos', produtos)) {
        res.status(201).json({ mensagem: 'Produto cadastrado!', produto: novoProduto });
    } else {
        res.status(500).json({ error: 'Erro ao salvar produto.' });
    }
});

// Busca produto individual por ID
app.get('/produtos/:id', (req, res) => {
    const produtos = lerDados('produtos');
    const produto = produtos.find(p => String(p.id) === String(req.params.id));
    
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(produto);
});

// --- ROTAS DE BUSCA ESPECÍFICA ---

// Busca usuário individual por código
app.get('/usuario/:codigo', (req, res) => {
    const usuarios = lerDados('usuario');
    const usuario = usuarios.find(u => String(u.codigo) === String(req.params.codigo));
    
    if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(usuario);
});

// Busca produto individual por ID (Caso queira reforçar ou substituir a existente)
app.get('/produtos/:id', (req, res) => {
    const produtos = lerDados('produtos');
    const produto = produtos.find(p => String(p.id) === String(req.params.id));
    
    if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    res.json(produto);
});
// --- INICIALIZAÇÃO ---

app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log(`📂 Arquivos: ${BANCO_DADOS.usuario} e ${BANCO_DADOS.produtos}`);
});
