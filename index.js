const express = require('express');
var session = require('express-session')
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid'); // Necesitas instalar el paquete uuid

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tfg'
});

// Middleware para permitir el uso de JSON en las solicitudes
app.use(express.json());

app.use(session({
  secret: 'mi_secreto', // Se utiliza para firmar la cookie de sesión
  resave: false, // Evita que la sesión se guarde de nuevo en el almacenamiento si no ha habido cambios
  saveUninitialized: false, // Evita que se guarde una sesión vacía para solicitudes que no la han modificado
  cookie: { secure: false } // Configuración de la cookie de sesión
}));

app.post('/nuevaPartida', (req, res) => {
  console.log("Solicitud a /nuevaPartida recibida");

  // Añadir logs para verificar la sesión del usuario
  console.log("Estado actual de req.session.usuario:", req.session.usuario);
  // Asumiendo que la sesión del usuario está correctamente configurada y disponible
  if (!req.session.usuario || !req.session.usuario.nombre) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  const { nivel } = req.body; // Nivel viene del cuerpo de la solicitud
  const usuarioNombre = req.session.usuario.nombre; // Nombre de usuario viene de la sesión
  console.log(usuarioNombre);
  const Cookie = uuidv4(); // Generación del UUID para la partida

  // Insertar la nueva partida en la base de datos usando el nombre de usuario de la sesión
  const query = 'INSERT INTO Partida (NomNiv, NomUs, Cookie) VALUES (?, ?, ?)';
  connection.query(query, [nivel, usuarioNombre, Cookie], (error, results) => {
    if (error) {
      console.error('Error al insertar la partida:', error);
      return res.status(500).json({ success: false, message: 'Error al crear la partida' });
    }

    // Establecer la cookie con el ID de la partida
    res.cookie('Cookie', Cookie, { maxAge: 900000, httpOnly: true });

    res.json({ success: true, message: 'Creada correctamente' });
  });
});

app.get('/obtenerPartidas', (req, res) => {
  // Verificar si el usuario está autenticado
  if (!req.session.usuario || !req.session.usuario.nombre) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  const usuarioNombre = req.session.usuario.nombre;

  // Consulta para obtener las partidas del usuario
  const query = 'SELECT IdPartida, NomNiv FROM Partida WHERE NomUs = ?';

  connection.query(query, [usuarioNombre], (error, results) => {
    if (error) {
      console.error('Error al obtener las partidas:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener las partidas' });
    }

    // Devolver las partidas encontradas
    res.json(results);
  });
});

// Ruta GET para obtener los datos de los ingredientes
app.get('/ingredientes', (req, res) => {
  const query = `
    SELECT 
      i.NomInteractuable, 
      pv.PuntsVida 
    FROM 
      Interactuable i
      INNER JOIN Tipus t ON i.NomTipus = t.NomTipus
      INNER JOIN PuntsVida pv ON t.NomTipus = pv.NomTipus
    WHERE 
      i.NomTipus = 'ingrediente'
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).json({ error: 'Error al obtener los ingredientes y sus puntos de vida' });
      return;
    }
    res.json(results);
  });
});


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

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Express y Socket.IO en funcionamiento en el puerto ${PORT}`);
});
