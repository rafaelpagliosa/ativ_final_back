import express from 'express';
import { dbMensagens } from '../models/mensagens.js';

const router = express.Router();

// Obter todas as mensagens
router.get('/', async (req, res) => {
  await dbMensagens.read();
  res.json(dbMensagens.data.mensagens);
});

// Criar uma nova mensagem
router.post('/', async (req, res) => {
  await dbMensagens.read();
  const { tipo, texto, destinatario, remetente, supervisor } = req.body;
  if (!tipo || !texto || !destinatario || !remetente || !supervisor) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
  }
  
  const id = dbMensagens.data.mensagens.length + 1;
  const novaMensagem = { id, tipo, texto, destinatario, remetente, dataCriacao: new Date().toISOString(), supervisor };
  
  dbMensagens.data.mensagens.push(novaMensagem);
  await dbMensagens.write();
  res.status(201).json(novaMensagem);
});

export default router;
