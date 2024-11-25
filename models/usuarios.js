import { Low, JSONFile } from 'lowdb';

const dbUsuarios = new Low(new JSONFile('./db/usuarios.json'));
dbUsuarios.read().then(() => {
  dbUsuarios.data ||= { usuarios: [] };
});

export { dbUsuarios };
