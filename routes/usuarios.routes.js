import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbUsuarios } from '../models/usuarios.js';

const router = express.Router();

// Rota para cadastro de usuário
router.post('/', async (req, res) => {
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
  const novoUsuario = { id: dbUsuarios.data.usuarios.length + 1, nome, email, senha: senhaHash };

  dbUsuarios.data.usuarios.push(novoUsuario);
  await dbUsuarios.write();

  const { senha: _, ...usuarioSemSenha } = novoUsuario;
  res.status(201).json(usuarioSemSenha);
});

// Rota para login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuario = dbUsuarios.data.usuarios.find(u => u.email === email);
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.status(400).json({ message: 'Usuário ou senha incorretos!' });
  }

  const payload = { email: usuario.email, nome: usuario.nome };
  const token = jwt.sign(payload, 'secreta_chave', { expiresIn: '1h' });
  res.json({ token, nome: usuario.nome });
});

export default router;
