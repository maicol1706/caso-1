const { leerDB, verificarClave } = require('./store');

const PODERES = {
  BIBLIOTECARIO: [
    'Crear, editar y eliminar libros',
    'Ver el catálogo y los disponibles',
    'Registrar un préstamo a nombre de un estudiante',
    'Ver los préstamos activos de un libro',
    'Registrar la devolución de cualquier préstamo activo'
  ],
  ESTUDIANTE: [
    'Ver el catálogo y los disponibles',
    'Solicitar un préstamo a su propio nombre',
    'Ver sus préstamos',
    'Devolver solo sus préstamos activos'
  ]
};

function publico(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    poderes: PODERES[usuario.rol]
  };
}

function buscarPorCorreo(correo) {
  return leerDB().usuarios.find((u) => u.correo === String(correo || '').trim().toLowerCase());
}

function buscarPorId(id) {
  return leerDB().usuarios.find((u) => u.id === Number(id));
}

function entrar(correo, clave) {
  const usuario = buscarPorCorreo(correo);
  if (!usuario || !verificarClave(clave, usuario.claveHash)) return null;
  return publico(usuario);
}

function listarEstudiantes() {
  return leerDB().usuarios
    .filter((u) => u.rol === 'ESTUDIANTE')
    .map((u) => ({ id: u.id, nombre: u.nombre, correo: u.correo }));
}

module.exports = { publico, buscarPorId, entrar, listarEstudiantes, PODERES };