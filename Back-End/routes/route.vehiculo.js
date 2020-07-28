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


//Insertar vehiculo
router.post('/', (req, res) => {
  const idVehiculo= req.body.idVehiculo;
  const descripcion = req.body.descripcion;
  const idColaborador = req.body.idColaborador;
  if (!idVehiculo || !descripcion || !idColaborador){

      return res.status(400).json({mensaje:'Falta datos'});

  }

  routePool.connect().then(pool => {
    return pool.request()
    .input('idVehiculo', sql.VarChar(50), idVehiculo)
    .input('descripcion', sql.NVarChar(300), descripcion)
    .input('idColaborador', sql.VarChar(20), idColaborador)
    //.ouput       -------------- para obtener el error desde base de datos
    .execute('ingresoVehiculo')
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

//Obtener vehiculo
router.get('/', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('obtenerVehiculo')
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

//Modificar vehiculo
router.put('/', (req, res) => {
  const idVehiculo= req.body.idVehiculo;
  const descripcion = req.body.descripcion;
  const idColaborador = req.body.idColaborador;
  if (!idVehiculo || !descripcion || !idColaborador)return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    .input('idVehiculo', sql.VarChar(50), idVehiculo)
    .input('descripcion', sql.NVarChar(300), descripcion)
    .input('idColaborador', sql.VarChar(20), idColaborador)
    .execute('modificarVehiculo')
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

//Modificar estado vehiculo
router.put('/estado', (req, res) => {
  const idVehiculo= req.body.idVehiculo;
  const estadoVehiculo= req.body.estadoVehiculo;
  if (estadoVehiculo > 1 || estadoVehiculo < 0) return res.status(400).json({mensaje:"Debe insertar 1 o 0 para el estado"});
  if (!idVehiculo || !estadoVehiculo) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    .input('idVehiculo', sql.VarChar(50), idVehiculo)
    .input('estadoVehiculo', sql.INT, estadoVehiculo)
    .execute('modificarEstadoVehiculo')
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


//Consulta
//Obtener la cantidad de km recorridos por vehiculo, con su Marca, POSEE EL GROUP BY
router.get('/consulta', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('cantKMXMarca')
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


//Vista
//Vista para calcular el promedio de km recorrido por vehiculo
router.get('/vista', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('promedioKMVehiculo')
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


module.exports = router;
