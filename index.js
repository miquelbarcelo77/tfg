const express = require('express');
var session = require('express-session')
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid'); //Per les cookies

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// BBDD
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tfg'
});

connection.connect(error => {
  if (error) {
    console.log(error);
    return console.error('Error al conectar a la base de datos:', error);
  }
  console.log('Conectado a la base de datos MySQL');
});

//Us de json a solicituds
app.use(express.json());

app.use(session({
  secret: 'mi_secreto', // Se utiliza para firmar la cookie de sesión
  resave: false, //No es torna a guardar
  saveUninitialized: false,
  cookie: { secure: false } // Configuración de la cookie de sesión
}));

//Endpoint que verifica la existencia d'un usuari (Falta contrasenya)
app.post('/verificar-usuario', (req, res) => {
  const username = req.body.username;
  console.log("Nombre de usuario recibido:", username);
  if (!username) {
    res.status(400).json({ error: 'Nombre de usuario no proporcionado' });
    return;
  }
  // Consultar la base de datos para verificar si el nombre de usuario está repetido
  const query = "SELECT COUNT(*) AS count FROM usuari WHERE NomUs = ?";
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.log(err);
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).json({ error: 'Error al verificar el nombre de usuario' });
      return;
    }
    // Verificar si el nombre de usuario está repetido
    const count = results[0].count;
    if (count > 0) {
      // Si el nombre de usuario existe en la base de datos, iniciar sesión en lugar de crear un nuevo usuario
      req.session.usuario = { nombre: username };
      res.status(200).json({ existe: true });
    } else {
      // Si el nombre de usuario no existe en la base de datos, devolver que el usuario no existe
      res.status(200).json({ existe: false });
    }
  });
});

app.post('/guardar-usuario', (req, res) => {
  const username = req.body.username;
  console.log("Nombre de usuario a guardar:", username);

  // Verificar si se recibió el nombre de usuario
  if (!username) {
    res.status(400).json({ error: 'Nombre de usuario no proporcionado' });
    return;
  }
  const query = "INSERT INTO usuari (NomUs) VALUES (?)"; // Cambio aquí
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error al guardar el nombre de usuario:', err);
      res.status(500).json({ error: 'Error al guardar el nombre de usuario' });
      return;
    }
    req.session.usuario = { nombre: username };
    res.status(200).json({ message: 'Nombre de usuario guardado correctamente' });
  });
});

//Endpoint que serveix per a crear una partida
app.post('/nuevaPartida', (req, res) => {
  if (!req.session.usuario || !req.session.usuario.nombre) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  const { nivel } = req.body;
  const usuarioNombre = req.session.usuario.nombre;

  // Insertar nueva partida
  const insertPartidaQuery = 'INSERT INTO partida (NomNiv, NomUs) VALUES (?, ?)';
  connection.query(insertPartidaQuery, [nivel, usuarioNombre], (error, partidaResults) => {
    if (error) {
      console.error('Error al insertar la partida:', error);
      return res.status(500).json({ success: false, message: 'Error al crear la partida' });
    }

    const nuevaPartidaId = partidaResults.insertId;
    req.session.partidaId = nuevaPartidaId;

    // Inicializar los objetivos para la nueva partida
    const selectObjetivosQuery = 'SELECT IdObj FROM objectiu WHERE NomNiv = ?';
    connection.query(selectObjetivosQuery, [nivel], (error, objetivosResults) => {
      if (error) {
        console.error('Error al obtener los objetivos del nivel:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener objetivos' });
      }

      // Preparar inserción masiva en Partida_Objectiu
      const objetivosData = objetivosResults.map(obj => [nuevaPartidaId, obj.IdObj, false]);
      console.log(objetivosData);
      console.log(objetivosResults);
      const insertObjetivosQuery = 'INSERT INTO partida_objectiu (IdPartida, IdObj, Completado) VALUES ?';
      console.log(insertObjetivosQuery);
      connection.query(insertObjetivosQuery, [objetivosData], (error) => {
        if (error) {
          console.error('Error al insertar objetivos en partida:', error);
          return res.status(500).json({ success: false, message: 'Error al inicializar objetivos de la partida' });
        }

        // Todo ha ido bien, enviar confirmación
        res.json({ success: true, message: 'Partida y objetivos inicializados correctamente', partidaId: nuevaPartidaId });
      });
    });
  });
});


app.get('/getPartidaId', (req, res) => {
  if (!req.session.usuario || !req.session.partidaId) {
    return res.status(401).json({ success: false, message: 'No autorizado o partida no iniciada' });
  }

  res.json({ success: true, partidaId: req.session.partidaId });
});

app.get('/obtenerPartidas', (req, res) => {
  // Verificar si el usuario está autenticado
  if (!req.session.usuario || !req.session.usuario.nombre) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  const usuarioNombre = req.session.usuario.nombre;

  // Consulta para obtener las partidas del usuario
  const query = 'SELECT IdPartida, NomNiv FROM partida WHERE NomUs = ?';

  connection.query(query, [usuarioNombre], (error, results) => {
    if (error) {
      console.error('Error al obtener las partidas:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener las partidas' });
    }

    // Devolver las partidas encontradas
    res.json(results);
  });
});

app.post('/seleccionarPartida', (req, res) => {
  const { idPartida } = req.body; // Asegúrate de recibir correctamente el idPartida del cuerpo de la solicitud
  if (!req.session.usuario) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }
  req.session.partidaId = idPartida; // Almacenar idPartida en la sesión
  res.json({ success: true, message: 'Partida seleccionada correctamente' });
});


app.get('/ingredientes', (req, res) => {
  if (!req.session.usuario || !req.session.partidaId) {
    console.log("Usuario no autenticado o partida no iniciada.");
    return res.status(401).json({ success: false, message: 'No autorizado o partida no iniciada' });
  }

  const idPartida = req.session.partidaId;

  // Obtener el nivel asociado a la partida
  const queryNivel = 'SELECT NomNiv FROM partida WHERE IdPartida = ?';
  connection.query(queryNivel, [idPartida], (error, resultsNivel) => {
    if (error || resultsNivel.length === 0) {
      console.error('Error al obtener el nivel de la partida:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener el nivel de la partida' });
    }

    const nomNiv = resultsNivel[0].NomNiv;

    // Ajustar la consulta para incluir el estado EsTallat de la tabla Partida_Interactuable_Estado
    const queryIngredientes = `
      SELECT 
        i.IdInteractuable,
        i.NomInteractuable, 
        pv.PuntsVida,
        COALESCE(pie.EsTallat, FALSE) AS EsTallat
      FROM 
        interactuable i
        INNER JOIN nivell_interactuable ni ON i.IdInteractuable = ni.IdInteractuable
        INNER JOIN puntsvida pv ON i.NomTipus = pv.NomTipus
        LEFT JOIN partida_interactuable pie ON i.IdInteractuable = pie.IdInteractuable AND pie.IdPartida = ?
      WHERE 
        ni.NomNiv = ?
    `;

    connection.query(queryIngredientes, [idPartida, nomNiv], (err, resultsIngredientes) => {
      if (err) {
        console.error('Error al ejecutar la consulta de ingredientes:', err);
        return res.status(500).json({ success: false, message: 'Error al obtener los ingredientes' });
      }
      console.log(`Ingredientes obtenidos para el nivel ${nomNiv}:`, resultsIngredientes);
      res.json(resultsIngredientes);
    });
  });
});

// Endpoint para marcar un ingrediente como cortado usando el idPartida desde la sesión
app.post('/actualizar-estado-ingrediente', (req, res) => {
  if (!req.session.usuario || !req.session.partidaId) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado o partida no iniciada' });
  }

  const idPartida = req.session.partidaId;
  const { idInteractuable, esTallat } = req.body;

  // Verificar que todos los campos necesarios están presentes
  if (idInteractuable === undefined || esTallat === undefined) {
    return res.status(400).json({ success: false, message: 'Datos incompletos para la actualización' });
  }

  // Preparar la consulta SQL para actualizar el estado EsTallat
  const query = `
    INSERT INTO partida_interactuable (IdPartida, IdInteractuable, EsTallat)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE EsTallat = VALUES(EsTallat);
  `;

  // Ejecutar la consulta
  connection.query(query, [idPartida, idInteractuable, esTallat], (error, results) => {
    if (error) {
      console.error('Error al actualizar el estado del ingrediente:', error);
      return res.status(500).json({ success: false, message: 'Error al actualizar el estado del ingrediente' });
    }

    res.json({ success: true, message: 'Estado del ingrediente actualizado correctamente' });
  });
});

// Endpoint para obtener los objetivos de una partida específica
app.get('/obtenerObjetivos', (req, res) => {
  // Verificar si el usuario está autenticado y si existe una partida en curso
  if (!req.session.usuario || !req.session.partidaId) {
    return res.status(401).json({ success: false, message: 'No autorizado o partida no iniciada' });
  }

  const idPartida = req.session.partidaId; // Usar el ID de la partida de la sesión

  // Primero, obtenemos el nivel asociado a la partida
  const queryNivel = 'SELECT NomNiv FROM partida WHERE IdPartida = ?';

  connection.query(queryNivel, [idPartida], (error, resultsNivel) => {
    if (error || resultsNivel.length === 0) {
      console.error('Error al obtener el nivel de la partida:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener el nivel de la partida' });
    }

    const nomNiv = resultsNivel[0].NomNiv;

    // Luego, obtenemos los objetivos para ese nivel, y su estado de completitud para la partida dada
    const query = `
      SELECT 
          o.IdObj, 
          o.NomObj, 
          o.DescObj, 
          o.Temps, 
          IFNULL(po.Completado, FALSE) as Completado
      FROM 
          objectiu o
      LEFT JOIN 
          partida_objectiu po ON o.IdObj = po.IdObj AND po.IdPartida = ?
      WHERE 
          o.NomNiv = ?
    `;

    connection.query(query, [idPartida, nomNiv], (error, results) => {
      if (error) {
        console.error('Error al obtener los objetivos del nivel para la partida:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener los objetivos del nivel' });
      }

      // Devolver los objetivos encontrados
      res.json(results);
    });
  });
});

app.post('/api/completarObjetivoPorIngrediente', (req, res) => {
  if (!req.session.usuario || !req.session.partidaId) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado o partida no iniciada' });
  }

  const idPartida = req.session.partidaId;
  const { idInteractuable } = req.body;

  const getObjetivosQuery = `
      SELECT IdObj
      FROM objetivointeractuable
      WHERE IdInteractuable = ?`;

  connection.query(getObjetivosQuery, [idInteractuable], (error, results) => {
    if (error) {
      console.error('Error al obtener los objetivos para el interactuable:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener los objetivos' });
    }

    const idsObj = results.map(obj => obj.IdObj);

    if (idsObj.length === 0) {
      return res.json({ success: true, message: 'No hay objetivos asociados con este interactuable', objetivos: [] });
    }

    console.log(idsObj);

    const updateObjetivosQuery = `
      UPDATE partida_objectiu
      SET Completado = TRUE
      WHERE IdPartida = ? AND IdObj IN (?)`;

    connection.query(updateObjetivosQuery, [idPartida, [idsObj]], (updateError) => {
      if (updateError) {
        console.error('Error al actualizar los objetivos como completados:', updateError);
        return res.status(500).json({ success: false, message: 'Error al actualizar los objetivos' });
      }

      // Devolver los objetivos actualizados
      res.json({ success: true, message: 'Objetivos actualizados correctamente como completados', objetivos: results });
    });
  });
});


app.post('/api/completarObjetivo', (req, res) => {
  // Verificar si el usuario está autenticado y si existe una partida en curso
  if (!req.session.usuario || !req.session.partidaId) {
    return res.status(401).json({ success: false, message: 'No autorizado o partida no iniciada' });
  }
  console.log("entroAQUI");
  const idPartida = req.session.partidaId;
  const { idObj, completado } = req.body;

  console.log(completado);
  const query = `
    UPDATE partida_objectiu 
    SET Completado = ?
    WHERE IdPartida = ? AND IdObj = ?`;

  connection.query(query, [completado, idPartida, idObj], (error, results) => {
    if (error) {
      console.error('Error al actualizar el estado del objetivo:', error);
      return res.status(500).json({ success: false, message: 'Error al completar el objetivo' });
    }

    res.json({ success: true, message: 'Objetivo actualizado correctamente' });
  });
});

// Configura Express para servir archivos estáticos desde el directorio 'public'
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/inicio.html');
});

// Evento de conexión en Socket.IO
io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  // Evento de desconexión en Socket.IO
  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

// Iniciar el servidor en el puerto 80
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Express y Socket.IO en funcionamiento en el puerto ${PORT}`);
});
