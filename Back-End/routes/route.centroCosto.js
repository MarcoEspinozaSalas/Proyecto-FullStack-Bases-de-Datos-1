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


//Insertar un centroCosto
router.post('/', (req, res) => {
  const idCentroCosto = req.body.idCentroCosto;
  const descripcion = req.body.descripcion;
  if (!idCentroCosto || !descripcion){

      return res.status(400).json({mensaje:'Falta datos'});

  }

  routePool.connect().then(pool => {
    return pool.request()
    .input('idCentroCosto', sql.CHAR(8), idCentroCosto)
    .input('descripcion', sql.VarChar(300), descripcion)
    //.ouput       -------------- para obtener el error desde base de datos
    .execute('ingresoCentroCosto')
  }).then(val => {
    routePool.close();
    if (val.recordset === []) return res.status(200).json({mensaje:"Vacío"});
    //console.log(val.recordset);
    let estado = val.recordset[0][''];
    if (estado === 1) return res.status(201).json({mensaje:"Se insertó"});
    else if (estado === 0) return res.status(200).json({mensaje:"No se insertó, ya exite"});
    else return res.sendStatus(418);
  }).catch(err => {
    routePool.close();
    console.error(err);
    err.status = 500;
    return next(err);
  });
});

//Modificar un centroCosto
router.put('/', (req, res) => {
  const idCentroCosto = req.body.idCentroCosto;
  const descripcion = req.body.descripcion;
  if (!idCentroCosto || !descripcion) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    //  .input('cedula',req.params.cedula)
    .input('idCentroCosto', sql.CHAR(8), idCentroCosto)
    .input('descripcion', sql.NVARCHAR(300), descripcion)
    .execute('modificarCentroCosto')
  }).then(val => {
    routePool.close();
    if (val.recordset === []) return res.status(200).json({estado: -2});
    let estado = val.recordset[0][''];
    if (estado === 1) return res.status(200).json({mensaje: "Se modificó"});
    else if (estado === 0) return res.status(200).json({estado: "No se modificó"});
    else return res.sendStatus(418);
  }).catch(err => {
    routePool.close();
    console.error(err);
    err.status = 500;
    return next(err);
  });
});

module.exports = router;
