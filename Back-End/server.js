require('dotenv').config();
const http = require('http'); //Librería para crear el servidor
const app = require('./app'); //Librería con todas las rutas, middlewares y demás

//Configuración del servidor
const port = process.env.PORT || 3000;
const host = process.env.HOST || '192.168.0.109';
const server = http.createServer(app);

//Mensaje de que el servidor está iniciado
server.listen(port, () => {
  console.log(`[El servidor está corriendo en la dirección '${host}:${port}']`);
});

// server.listen(port, host);

//Establecer orden y tipos de middlewares
//?Crear nuevo proyecto de node
//""Completar función de login (con token incluído)
//Diseñar una estructura para el proyecto
