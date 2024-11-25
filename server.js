import express from 'express';
import cors from 'cors';
import usuariosRoutes from './routes/usuarios.routes.js';
import mensagensRoutes from './routes/mensagens.routes.js';

const app = express();
app.use(express.json());
app.use(cors());

// Definição das rotas principais
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/mensagens', mensagensRoutes);

// Inicialização do servidor
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
