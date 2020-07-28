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


//Insertar tipoLabor
router.post('/', (req, res) => {
  const idTipoLabor = req.body.idTipoLabor;
  const descripcion = req.body.descripcion;
  const idLabor = req.body.idLabor;
  if (!idTipoLabor || !descripcion || !idLabor){

      return res.status(400).json({mensaje:'Falta datos'});

  }

  routePool.connect().then(pool => {
    return pool.request()
    .input('idTipoLabor', sql.Char(3), idTipoLabor)
    .input('descripcion', sql.NVarChar(300), descripcion)
    .input('idLabor', sql.Char(3), idLabor)
    //.ouput       -------------- para obtener el error desde base de datos
    .execute('ingresoTipoLabor')
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

//Obtener tipoLabor
router.get('/', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('obtenerTipoLabor')
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

//Modificar tipoLabor
router.put('/', (req, res) => {
  const idTipoLabor = req.body.idTipoLabor;
  const descripcion = req.body.descripcion;
  const idLabor = req.body.idLabor;
  if (!idTipoLabor || !descripcion || !idLabor)return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    .input('idTipoLabor', sql.Char(3), idTipoLabor)
    .input('descripcion', sql.NVarChar(300), descripcion)
    .input('idLabor', sql.Char(3), idLabor)
    .execute('modificarTipoLabor')
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

//Modificar estado tipoLabor
router.put('/estado', (req, res) => {
  const idTipoLabor = req.body.idTipoLabor;
  const estadoTipoLabor= req.body.estadoTipoLabor;
  if (estadoTipoLabor > 1 || estadoTipoLabor < 0) return res.status(400).json({mensaje:"Debe insertar 1 o 0 para el estado"});
  if (!idTipoLabor || !estadoTipoLabor) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    .input('idTipoLabor', sql.Char(3), idTipoLabor)
    .input('estadoTipoLabor', sql.INT, estadoTipoLabor)
    .execute('modificarEstadoTipoLabor')
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
