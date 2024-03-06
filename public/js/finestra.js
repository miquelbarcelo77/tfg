//Definir base de datos
const database = openDatabase('nombre_de_tu_base_de_datos', '1.0', 'Descripción', 2 * 1024 * 1024);

// Definir un mapeo de modelos GLB predefinidos para cada ingrediente
const modelos = {
  tomate: 'url(tomate.glb)',  // URL del archivo GLB para el tomate
  calabacin: 'url(calabacin.glb)', // URL del archivo GLB para el calabacín
  // Añade más URLs de modelos GLB para otros ingredientes según sea necesario
};

// Consulta de ingredientes desde la base de datos
database.transaction(function(tx) {
  tx.executeSql('SELECT * FROM ingredientes', [], function(tx, results) {
    const len = results.rows.length;
    for (let i = 0; i < len; i++) {
      const ingrediente = results.rows.item(i);
      // Obtén la URL del modelo GLB correspondiente al ID del ingrediente
      const modelo = modelos[ingrediente.id];
      // Crea entidades de A-Frame basadas en los datos del ingrediente y el modelo GLB
      crearEntidadAFrame(ingrediente, modelo);
    }
  }, null);
});

// Función para crear entidades de A-Frame con modelo GLB específico
function crearEntidadAFrame(ingrediente, modelo) {
  const entidad = document.createElement('a-entity');
  entidad.setAttribute('gltf-model', modelo);
  entidad.setAttribute('position', ingrediente.posicion);
  // Agregar la entidad al escenario de A-Frame
  document.querySelector('a-scene').appendChild(entidad);
}

