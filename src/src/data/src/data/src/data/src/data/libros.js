const { leerDB, guardarDB } = require('./store');

function obtenerTodos() {
  return leerDB().libros;
}

function obtenerPorId(id) {
  return leerDB().libros.find((l) => l.id === Number(id)) || null;
}

function crear(datos) {
  const db = leerDB();
  const nuevoId = db.libros.length ? Math.max(...db.libros.map((l) => l.id)) + 1 : 1;
  const totales = Number(datos.ejemplaresTotales);
  const nuevo = {
    id: nuevoId,
    titulo: datos.titulo,
    autor: datos.autor,
    categoria: datos.categoria || 'General',
    ejemplaresTotales: totales,
    ejemplaresDisponibles: totales
  };
  db.libros.push(nuevo);
  guardarDB(db);
  return nuevo;
}

function actualizar(id, cambios) {
  const db = leerDB();
  const libro = db.libros.find((l) => l.id === Number(id));
  if (!libro) return null;
  Object.assign(libro, cambios);
  guardarDB(db);
  return libro;
}

function eliminar(id) {
  const db = leerDB();
  const existe = db.libros.some((l) => l.id === Number(id));
  if (!existe) return false;
  db.libros = db.libros.filter((l) => l.id !== Number(id));
  db.prestamos = db.prestamos.filter((p) => p.libroId !== Number(id));
  guardarDB(db);
  return true;
}

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };