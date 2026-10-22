const { leerDB, guardarDB } = require('./store');

function obtenerTodos() {
  return leerDB().prestamos;
}

function obtenerPorId(id) {
  return leerDB().prestamos.find((p) => p.id === Number(id)) || null;
}

function crear(datos) {
  const db = leerDB();
  const libro = db.libros.find((l) => l.id === Number(datos.libroId));
  if (!libro) {
    const error = new Error('El libro indicado no existe');
    error.codigo = 404;
    throw error;
  }
  if (libro.ejemplaresDisponibles <= 0) {
    const error = new Error('No hay ejemplares disponibles de este libro');
    error.codigo = 400;
    throw error;
  }
  const repetido = db.prestamos.find(
    (p) => p.libroId === libro.id && p.usuarioId === datos.usuarioId && p.estado === 'ACTIVO'
  );
  if (repetido) {
    const error = new Error('Ese estudiante ya tiene un préstamo activo de este libro');
    error.codigo = 400;
    throw error;
  }
  const nuevoId = db.prestamos.length ? Math.max(...db.prestamos.map((p) => p.id)) + 1 : 1;
  const nuevo = {
    id: nuevoId,
    libroId: libro.id,
    usuarioId: datos.usuarioId,
    nombreEstudiante: datos.nombreEstudiante,
    fechaPrestamo: new Date().toISOString(),
    fechaDevolucion: null,
    estado: 'ACTIVO'
  };
  libro.ejemplaresDisponibles -= 1;
  db.prestamos.push(nuevo);
  guardarDB(db);
  return { ...nuevo, titulo: libro.titulo };
}

function devolver(id, usuarioActual) {
  const db = leerDB();
  const prestamo = db.prestamos.find((p) => p.id === Number(id));
  if (!prestamo) {
    const error = new Error('Préstamo no encontrado');
    error.codigo = 404;
    throw error;
  }
  if (usuarioActual.rol === 'ESTUDIANTE' && prestamo.usuarioId !== usuarioActual.id) {
    const error = new Error('Solo puedes devolver tus propios préstamos');
    error.codigo = 403;
    throw error;
  }
  if (prestamo.estado === 'DEVUELTO') {
    const error = new Error('Este préstamo ya fue devuelto');
    error.codigo = 400;
    throw error;
  }
  const fechaDevolucion = new Date().toISOString();
  if (fechaDevolucion < prestamo.fechaPrestamo) {
    const error = new Error('La fecha de devolución no puede ser anterior a la fecha de préstamo');
    error.codigo = 400;
    throw error;
  }
  const libro = db.libros.find((l) => l.id === prestamo.libroId);
  if (!libro) {
    const error = new Error('El libro del préstamo ya no existe');
    error.codigo = 404;
    throw error;
  }
  prestamo.estado = 'DEVUELTO';
  prestamo.fechaDevolucion = fechaDevolucion;
  libro.ejemplaresDisponibles += 1;
  guardarDB(db);
  return { mensaje: 'Préstamo marcado como devuelto' };
}

function listarActivosDeLibro(libroId) {
  const db = leerDB();
  const libro = db.libros.find((l) => l.id === Number(libroId));
  if (!libro) {
    const error = new Error('El libro indicado no existe');
    error.codigo = 404;
    throw error;
  }
  return db.prestamos
    .filter((p) => p.libroId === libro.id && p.estado === 'ACTIVO')
    .map((p) => ({ ...p, titulo: libro.titulo }));
}

function listarDeUsuario(usuarioId) {
  const db = leerDB();
  return db.prestamos
    .filter((p) => p.usuarioId === Number(usuarioId))
    .map((p) => {
      const libro = db.libros.find((l) => l.id === p.libroId);
      return { ...p, titulo: libro ? libro.titulo : null };
    });
}

module.exports = { obtenerTodos, obtenerPorId, crear, devolver, listarActivosDeLibro, listarDeUsuario };