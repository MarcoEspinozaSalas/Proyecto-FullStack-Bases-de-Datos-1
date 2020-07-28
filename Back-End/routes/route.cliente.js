//Constantes
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const sql = require('mssql');
const conn = require('./dbconn');
const routePool = new sql.ConnectionPool(conn);
//Usar las rutas
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());


//Insertar un cliente
router.post('/', (req, res) => {
  const idCliente = req.body.idCliente;
  const razon = req.body.razon;
  if (!idCliente || !razon){

      return res.status(400).json({mensaje:'Falta datos'});

  }

  routePool.connect().then(pool => {
    return pool.request()
    .input('idCliente', sql.CHAR(7), idCliente)
    .input('razon', sql.VarChar(50), razon)
    //.ouput       -------------- para obtener el error desde base de datos
    .execute('ingresoCliente')
  }).then(val => {
    routePool.close();
    if (val.recordset === []) return res.status(200).json({mensaje:"Indefinido"});
    let estado = val.recordset[0][''];
    if (estado === 1) return res.status(201).json({mensaje:"Se insertó", estado: estado});
    else if (estado === 0) return res.status(200).json({mensaje:"No se insertó, ya existe", estado: estado});
    else return res.sendStatus(418);
  }).catch(err => {
    routePool.close();
    console.error(err);
    err.status = 500;
    return next(err);
  });
});

//Obtener clientes
router.get('/', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('obtenerClientes')
  }).then(val => {
    routePool.close();
    if (val.recordset === undefined) return res.status(404).json({mensaje:"No hay datos"});
    //Este console.log es para saber el formato en que lo mando
    return res.status(200).json(val.recordset);
  }).catch(err => {
    routePool.close();
    console.error(err);
    err.status = 500;
    return next(err);
  });

});

//Modificar cliente
router.put('/', (req, res) => {
  const idCliente = req.body.idCliente;
  const razon = req.body.razon;
  if (!idCliente || !razon) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    .input('idCliente', sql.CHAR(7), idCliente)
    .input('razon', sql.NVARCHAR(50), razon)
    .execute('modificarCliente')
  }).then(val => {
    routePool.close();
    if (val.recordset === []) return res.status(200).json({mensaje:"Indefinido"});
    let estado = val.recordset[0][''];
    if (estado === 1) return res.status(200).json({mensaje: "Se modificó", estado: estado});
    else if (estado === 0) return res.status(200).json({estado: "No se modificó", estado: estado});
    else if (estado === 2) return res.status(200).json({mensaje: "No se permite acciones en este registro", estado: estado});
    else return res.sendStatus(418);
  }).catch(err => {
    routePool.close();
    console.error(err);
    err.status = 500;
    return next(err);
  });
});

//Modificar estado cliente
router.put('/estado', (req, res) => {
  const idCliente = req.body.idCliente;
  const estadoCliente= req.body.estadoCliente;
  if (estadoCliente > 1 || estadoCliente < 0) return res.status(400).json({mensaje:"Debe insertar 1 o 0 para el estado"});
  if (!idCliente || !estadoCliente) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    .input('idCliente', sql.CHAR(7), idCliente)
    .input('estadoCliente', sql.INT, estadoCliente)
    .execute('modificarEstadoCliente')
  }).then(val => {
    routePool.close();
    if (val.recordset === []) return res.status(200).json({mensaje:"Indefinido"});
    let estado = val.recordset[0][''];
    if (estado === 1) return res.status(200).json({mensaje: "Se modificó", estado: estado});
    else if (estado === 0) return res.status(200).json({mensaje: "No se modificó", estado: estado});
    else return res.sendStatus(418);
  }).catch(err => {
    routePool.close();
    console.error(err);
    err.status = 500;
    return next(err);
  });
});

module.exports = router;
