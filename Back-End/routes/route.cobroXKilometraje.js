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


//Insertar cobroXKilometraje
router.post('/', (req, res) => {
  const idViatico = req.body.idViatico;
  const KM = req.body.KM;
  const montoXKM = req.body.montoXKM;
  const idVehiculo = req.body.idVehiculo;
  if (!idViatico || !KM || !montoXKM || !idVehiculo){

      return res.status(400).json({mensaje:'Falta datos'});

  }

  routePool.connect().then(pool => {
    return pool.request()
    .input('idViatico', sql.INT, idViatico)
    .input('KM', sql.DECIMAL(10,2), KM)
    .input('montoXKM', sql.DECIMAL(10,2), montoXKM)
    .input('idVehiculo', sql.VarChar(50), idVehiculo)
    //.ouput       -------------- para obtener el error desde base de datos
    .execute('ingresoCobroXKilometraje')
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

//Obtener cobroXKilometraje
router.get('/', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('obtenerCobroXKilometraje')
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

//Modificar cobroXKilometraje
router.put('/', (req, res) => {
  const idViatico = req.body.idViatico;
  const KM = req.body.KM;
  const montoXKM = req.body.montoXKM;
  const idVehiculo = req.body.idVehiculo;
  if (!idViatico || !KM || !montoXKM || !idVehiculo) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    //  .input('cedula',req.params.cedula)
    .input('idViatico', sql.INT, idViatico)
    .input('KM', sql.DECIMAL(10,2), KM)
    .input('montoXKM', sql.DECIMAL(10,2), montoXKM)
    .input('idVehiculo', sql.VarChar(50), idVehiculo)
    .execute('modificarCobroXKilometraje')
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

//Modificar estado cobroXKilometraje
router.put('/estado', (req, res) => {
  const idViatico = req.body.idViatico;
  const estadoCobroXKilometraje = req.body.estadoCobroXKilometraje;
  if (estadoCobroXKilometraje > 1 || estadoCobroXKilometraje < 0) return res.status(400).json({mensaje:"Debe insertar 1 o 0 para el estado"});
  if (!idViatico || !estadoCobroXKilometraje) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool =>
  routePool.connect().then(pool => {
    return pool.request()
    //  .input('cedula',req.params.cedula)
      .input('idViatico', sql.INT, idViatico)
    .input('estadoCobroXKilometraje', sql.INT, estadoCobroXKilometraje)
    .execute('modificarEstadoCobroXKilometraje')
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

//Vista
//Vista que permite observar el calculo de la multa del kilometraje por vehiculo
router.get('/vista', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('vistaCobroKM')
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
