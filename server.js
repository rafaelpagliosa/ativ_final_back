import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Low, JSONFile } from 'lowdb';

const app = express();

const dbUsuarios = new Low(new JSONFile('usuarios.json'));
const dbMensagens = new Low(new JSONFile('mensagens.json'));

app.use(express.json());
app.use(cors());

dbUsuarios.read().then(() => {
    dbUsuarios.data ||= { usuarios: [] };
});
dbMensagens.read().then(() => {
    dbMensagens.data ||= { mensagens: [] };
});


app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});

app.post('/api/usuarios', async (req, res) => {
    await dbUsuarios.read(); 

    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios!' });
    }

    const usuarioExistente = dbUsuarios.data.usuarios.find(u => u.email === email);
    if (usuarioExistente) {
        return res.status(400).json({ error: 'Usuário já cadastrado!' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = {
        id: dbUsuarios.data.usuarios.length + 1,
        nome,
        email,
        senha: senhaHash
    };

    
    dbUsuarios.data.usuarios.push(novoUsuario);

   
    await dbUsuarios.write();

   
    const { senha: _, ...usuarioSemSenha } = novoUsuario;
    res.status(201).json(usuarioSemSenha);
});

app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;


    const usuario = dbUsuarios.data.usuarios.find(u => u.email === email);

    if (!usuario) {
        return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
        return res.status(400).json({ message: 'Senha incorreta' });
    }

   
    const payload = { email: usuario.email, nome: usuario.nome };
    const token = jwt.sign(payload, 'secreta_chave', { expiresIn: '1h' });

  
    res.json({
        token: token,
        nome: usuario.nome
    });
});

app.get('/api/mensagens', async (req, res) => {
    await dbMensagens.read(); 
    res.json(dbMensagens.data.mensagens); 
});

app.post('/api/mensagens', async (req, res) => {
    await dbMensagens.read();

    const { tipo, texto, destinatario, remetente, supervisor } = req.body;

    if (!tipo || !texto || !destinatario || !remetente || !supervisor) {
        return res.status(400).json({ error: 'Tipo, texto, destinatário, remetente e supervisor são obrigatórios!' });
    }

    const id = dbMensagens.data.mensagens.length > 0 ? dbMensagens.data.mensagens[dbMensagens.data.mensagens.length - 1].id + 1 : 1;

    const novaMensagem = {
        id,
        tipo,
        texto,
        destinatario,
        remetente,
        dataCriacao: new Date().toISOString(),
        supervisor
    };

    dbMensagens.data.mensagens.push(novaMensagem);
    await dbMensagens.write();

    res.status(201).json(novaMensagem);
});

app.get('/api/mensagens/:id', async (req, res) => {
    await dbMensagens.read();
    const mensagemId = parseInt(req.params.id); 

    const mensagem = dbMensagens.data.mensagens.find(m => m.id === mensagemId);
    if (!mensagem) {
        return res.status(404).json({ error: 'Mensagem não encontrada!' });
    }

    res.json(mensagem);
});

app.put('/api/mensagens/:id', async (req, res) => {
    await dbMensagens.read();
    const mensagemId = parseInt(req.params.id);
    const { tipo, texto, destinatario, remetente, supervisor } = req.body;

   
    const mensagemIndex = dbMensagens.data.mensagens.findIndex(m => m.id === mensagemId);
    if (mensagemIndex === -1) {
        return res.status(404).json({ error: 'Mensagem não encontrada!' });
    }

    
    dbMensagens.data.mensagens[mensagemIndex] = {
        ...dbMensagens.data.mensagens[mensagemIndex],
        tipo: tipo || dbMensagens.data.mensagens[mensagemIndex].tipo,
        texto: texto || dbMensagens.data.mensagens[mensagemIndex].texto,
        destinatario: destinatario || dbMensagens.data.mensagens[mensagemIndex].destinatario,
        remetente: remetente || dbMensagens.data.mensagens[mensagemIndex].remetente,
        supervisor: supervisor || dbMensagens.data.mensagens[mensagemIndex].supervisor,
        dataAtualizacao: new Date().toISOString() 
    };

    await dbMensagens.write();
    res.json(dbMensagens.data.mensagens[mensagemIndex]);
});

app.patch('/api/mensagens/:id', async (req, res) => {
    await dbMensagens.read();
    const mensagemId = parseInt(req.params.id);
  
    const mensagem = dbMensagens.data.mensagens.find(m => m.id === mensagemId);
    if (!mensagem) {
      return res.status(404).json({ error: 'Mensagem não encontrada!' });
    }
  
    mensagem.status = 'excluída';
    await dbMensagens.write();
    res.status(200).json(mensagem);
  });
  
  
