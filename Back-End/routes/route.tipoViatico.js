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


//Insertar tipoViatico
router.post('/', (req, res) => {
  const idTipoViatico= req.body.idTipoViatico;
  const descripcion = req.body.descripcion;
  if (!idTipoViatico || !descripcion){

      return res.status(400).json({mensaje:'Falta datos'});

  }

  routePool.connect().then(pool => {
    return pool.request()
    .input('idTipoViatico', sql.Char(2), idTipoViatico)
    .input('descripcion', sql.NVarChar(300), descripcion)
    //.ouput       -------------- para obtener el error desde base de datos
    .execute('ingresoTipoViatico')
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

//Obtener tipoViatico
router.get('/', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('obtenerTipoViatico')
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

//Modificar tipoViatico
router.put('/', (req, res) => {
  const idTipoViatico= req.body.idTipoViatico;
  const descripcion = req.body.descripcion;
  if (!idTipoViatico || !descripcion)return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    .input('idTipoViatico', sql.Char(2), idTipoViatico)
    .input('descripcion', sql.VarChar(300), descripcion)
    .execute('modificarTipoViatico')
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

//Modificar estado tipoViatico
router.put('/estado', (req, res) => {
  const idTipoViatico = req.body.idTipoViatico;
  const estadoTipoViatico= req.body.estadoTipoViatico;
  if (estadoTipoViatico > 1 || estadoTipoViatico < 0) return res.status(400).json({mensaje:"Debe insertar 1 o 0 para el estado"});
  if (!idTipoViatico || !estadoTipoViatico) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    .input('idTipoViatico', sql.Char(2), idTipoViatico)
    .input('estadoTipoViatico', sql.INT, estadoTipoViatico)
    .execute('modificarEstadoTipoViatico')
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
