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


//Insertar sucursal
router.post('/', (req, res) => {
  const nombre = req.body.nombre;
  const idCliente = req.body.idCliente;
  if (!nombre || !idCliente){

      return res.status(400).json({mensaje:'Falta datos'});

  }

  routePool.connect().then(pool => {
    return pool.request()
    .input('nombre', sql.VarChar(50), nombre)
    .input('idCliente', sql.Char(7), idCliente)
    //.ouput       -------------- para obtener el error desde base de datos
    .execute('ingresoSucursal')
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

//Obtener sucursal
router.get('/', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('obtenerSucursales')
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

//Modificar sucursal
router.put('/', (req, res) => {
  const idSucursal = req.body.idSucursal;
  const nombre = req.body.nombre;
  const idCliente = req.body.idCliente;
  if (!idSucursal || !nombre || !idCliente) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    .input('idSucursal', sql.INT, idSucursal)
    .input('nombre', sql.VarChar(50), nombre)
    .input('idCliente', sql.Char(7), idCliente)
    .execute('modificarSucursal')
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

//Modificar estado sucursal
router.put('/estado', (req, res) => {
  const idSucursal = req.body.idSucursal;
  const estadoSucursal= req.body.estadoSucursal;
  if (estadoSucursal > 1 || estadoSucursal < 0) return res.status(400).json({mensaje:"Debe insertar 1 o 0 para el estado"});
  if (!idSucursal || !estadoSucursal) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    .input('idSucursal', sql.CHAR(3), idSucursal)
    .input('estadoSucursal', sql.INT, estadoSucursal)
    .execute('modificarEstadoSucursal')
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

//Cursor sucursal
router.get('/cursor', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('cursorSucursal')
  }).then(val => {
    routePool.close();
    if (val.recordset === undefined) return res.status(404).json({mensaje:"No hay datos"});
    //Este console.log es para saber el formato en que lo mando
    return res.status(200).json(val.recordsets);
  }).catch(err => {
    routePool.close();
    console.error(err);
    err.status = 500;
    return next(err);
  });

});

module.exports = router;
