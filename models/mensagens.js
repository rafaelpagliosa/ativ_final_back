import { Low, JSONFile } from 'lowdb';

const dbMensagens = new Low(new JSONFile('./db/mensagens.json'));
dbMensagens.read().then(() => {
  dbMensagens.data ||= { mensagens: [] };
});

export { dbMensagens };
