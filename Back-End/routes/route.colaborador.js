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


//Insertar colaborador
router.post('/', (req, res) => {
  const idColaborador= req.body.idColaborador;
  const descripcion = req.body.descripcion;
  const responsable = req.body.responsable;
  if (!idColaborador || !descripcion || !responsable){

      return res.status(400).json({mensaje:'Falta datos'});

  }

  routePool.connect().then(pool => {
    return pool.request()
    .input('idColaborador', sql.VARCHAR(20), idColaborador)
    .input('descripcion', sql.NVarChar(300), descripcion)
    .input('responsable', sql.VarChar(50), responsable)
    //.ouput       -------------- para obtener el error desde base de datos
    .execute('ingresoColaborador')
  }).then(val => {
    routePool.close();
    if (val.recordset === []) return res.status(200).json({mensaje:"Indefinido"});
    let estado = val.recordset[0][''];
    if (estado === 1) return res.status(201).json({mensaje:"Se insertó", estado: estado});
    else if (estado === 0) return res.status(200).json({mensaje:"No se insertó, ya exite", estado: estado});
    else return res.sendStatus(418);
  }).catch(err => {
    routePool.close();
    console.error(err);
    err.status = 500;
    return next(err);
  });
});

//Obtener colaborador
router.get('/', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('obtenerColaborador')
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

//Modificar colaborador
router.put('/', (req, res) => {
  const idColaborador= req.body.idColaborador;
  const descripcion = req.body.descripcion;
  const responsable = req.body.responsable;
  if (!idColaborador || !descripcion || !responsable) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    //  .input('cedula',req.params.cedula)
    .input('idColaborador', sql.VARCHAR(20), idColaborador)
    .input('descripcion', sql.NVarChar(300), descripcion)
    .input('responsable', sql.VarChar(50), responsable)
    .execute('modificarColaborador')
  }).then(val => {
    routePool.close();
    if (val.recordset === []) return res.status(200).json({mensaje: "Indefinido"});
    let estado = val.recordset[0][''];
    if (estado === 1) return res.status(200).json({mensaje: "Se modificó", estado: estado});
    else if (estado === 0) return res.status(200).json({mensaje: "No se modificó", estado: estado});
    else if (estado === 2) return res.status(200).json({mensaje: "No se permite acciones en este registro", estado: estado});
    else return res.sendStatus(418);
  }).catch(err => {
    routePool.close();
    console.error(err);
    err.status = 500;
    return next(err);
  });
});

//Modificar estado colaborador
router.put('/estado', (req, res) => {
  const idColaborador= req.body.idColaborador;
  const estadoColaborador= req.body.estadoColaborador;
  if (estadoColaborador > 1 || estadoColaborador < 0) return res.status(400).json({mensaje:"Debe insertar 1 o 0 para el estado"});
  if (!idColaborador || !estadoColaborador) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool =>
  routePool.connect().then(pool => {
    return pool.request()
    //  .input('cedula',req.params.cedula)
    .input('idColaborador', sql.VARCHAR(20), idColaborador)
    .input('estadoColaborador', sql.INT, estadoColaborador)
    .execute('modificarEstadoColaborador')
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
