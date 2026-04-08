const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());

// --- CONFIGURAÇÃO DE CAMINHOS ---
const BANCO_DADOS = {
    clientes: path.join(__dirname, 'clientes.json'),
    produtos: path.join(__dirname, 'produtos.json'),
    usuarios: path.join(__dirname, 'usuarios.json')
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

// --- ROTAS DE CLIENTES ---

app.get('/clientes', (req, res) => {
    res.json(lerDados('clientes'));
});

app.post('/clientes', (req, res) => {
    const { cpf, nome, idade, endereco, bairro, contato } = req.body;

    if (!cpf || !nome || !idade) {
        return res.status(400).json({ error: 'Dados essenciais faltando (CPF, Nome, Idade)' });
    }

    const clientes = lerDados('clientes');
    if (clientes.some(c => String(c.cpf) === String(cpf))) {
        return res.status(400).json({ error: 'Este CPF já está cadastrado.' });
    }

    const novoCliente = { 
        cpf: String(cpf), 
        nome, 
        idade: Number(idade), 
        endereco, 
        bairro, 
        contato 
    };

    clientes.push(novoCliente);
    if (salvarDados('clientes', clientes)) {
        res.status(201).json({ mensagem: 'Cliente cadastrado!', cliente: novoCliente });
    } else {
        res.status(500).json({ error: 'Erro ao salvar cliente.' });
    }
    // Busca cliente individual por CPF
app.get('/clientes/:cpf', (req, res) => {
    const clientes = lerDados('clientes');
    const cliente = clientes.find(c => String(c.cpf) === String(req.params.cpf));
    
    if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    res.json(cliente);
});
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

// --- ROTAS DE USUÁRIOS ---

// Listar usuários
app.get('/usuarios', (req, res) => {
    res.json(lerDados('usuarios'));
});

// Cadastrar usuário
app.post('/usuarios', (req, res) => {
    const { id, nome, email, senha } = req.body;

    if (!id || !nome || !email || !senha) {
        return res.status(400).json({ error: 'Dados obrigatórios: id, nome, email, senha' });
    }

    const usuarios = lerDados('usuarios');

    // Verifica se email já existe
    if (usuarios.some(u => u.email === email)) {
        return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    const novoUsuario = {
        id: String(id),
        nome,
        email,
        senha
    };

    usuarios.push(novoUsuario);

    if (salvarDados('usuarios', usuarios)) {
        res.status(201).json({ mensagem: 'Usuário cadastrado!', usuario: novoUsuario });
    } else {
        res.status(500).json({ error: 'Erro ao salvar usuário.' });
    }
});

// Buscar usuário por ID
app.get('/usuarios/:id', (req, res) => {
    const usuarios = lerDados('usuarios');
    const usuario = usuarios.find(u => String(u.id) === String(req.params.id));

    if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json(usuario);
});

// Login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const usuarios = lerDados('usuarios');

    const usuario = usuarios.find(
        u => u.email === email && u.senha === senha
    );

    if (!usuario) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    res.status(200).json({
        mensagem: 'Login realizado com sucesso',
        usuario
    });
});


app.post('/login',(req, res)=>{ 

    const { email, senha } = read.body;
    const usuarios = lerUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (!usuario){
        return res.status(401).json({error: 'Email ou senha incorreto'});
    }
     res.status(200).json({message:'login realizado com sucesso', usuario});

});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log(`📂 Arquivos: ${BANCO_DADOS.clientes} e ${BANCO_DADOS.produtos}`);
});
