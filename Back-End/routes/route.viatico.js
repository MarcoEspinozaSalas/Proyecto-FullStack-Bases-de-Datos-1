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


//Insertar viatico
router.post('/', (req, res) => {
  const proveedor = req.body.proveedor;
  const numFactura = req.body.numFactura;
  const fecha= req.body.fecha;
  const monto= req.body.monto;
  const notas= req.body.notas;
  const numPax= req.body.numPax;
  const boleta= req.body.boleta;
  const idTipoViatico= req.body.idTipoViatico;
  const idColaborador= req.body.idColaborador;
  const idEvento= req.body.idEvento;
  if (!proveedor || !numFactura || !fecha || !monto || !notas
    || !numPax || !boleta || !idTipoViatico || !idColaborador || !idEvento){

      return res.status(400).json({mensaje:'Falta datos'});

  }

  routePool.connect().then(pool => {
    return pool.request()
    .input('proveedor', sql.NVarChar(300), proveedor)
    .input('numFactura', sql.BigInt, numFactura)
    .input('fecha', sql.Char(10), fecha)
    .input('monto', sql.SmallMoney, monto)
    .input('notas', sql.NVarChar(300), notas)
    .input('numPax', sql.INT, numPax)
    .input('boleta', sql.NVarChar(300), boleta)
    .input('idTipoViatico', sql.Char(2), idTipoViatico)
    .input('idColaborador', sql.VarChar(20), idColaborador)
    .input('idEvento', sql.VarChar(10), idEvento)
    //.ouput       -------------- para obtener el error desde base de datos
    .execute('ingresoViatico')
  }).then(val => {
    routePool.close();
    if (val.recordset === []) return res.status(200).json({mensaje:"Indefinido"});
    let estado = val.recordset[0][''];
    if (estado === 1) return res.status(201).json({mensaje:"Se insertó", estado: estado});
    else if (estado === 0) return res.status(200).json({mensaje:"No se insertó, ya existe", estado: estado});
    else return res.sendStatus(418);
  }).catch(err => {
    routePool.close();
    if(err.message == 'The transaction ended in the trigger. The batch has been aborted.'){
      return res.status(405).json({message: "Error de trigger"})
    }
    console.error(err);
    err.status = 500;
    return next(err);
  });
});

//Obtener viatico
router.get('/', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('obtenerViatico')
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

//Modificar viatico
router.put('/', (req, res) => {
  const idViatico = req.body.idViatico;
  const proveedor = req.body.proveedor;
  const numFactura = req.body.numFactura;
  const fecha= req.body.fecha;
  const monto= req.body.monto;
  const notas= req.body.notas;
  const numPax= req.body.numPax;
  const boleta= req.body.boleta;
  const idTipoViatico= req.body.idTipoViatico;
  const idColaborador= req.body.idColaborador;
  const idEvento= req.body.idEvento;
  if (!idViatico || !proveedor || !numFactura || !fecha || !monto || !notas
    || !numPax || !boleta || !idTipoViatico || !idColaborador || !idEvento)return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    .input('idViatico', sql.INT, idViatico)
    .input('proveedor', sql.NVarChar(300), proveedor)
    .input('numFactura', sql.BigInt, numFactura)
    .input('fecha', sql.Char(10), fecha)
    .input('monto', sql.SmallMoney, monto)
    .input('notas', sql.NVarChar(300), notas)
    .input('numPax', sql.INT, numPax)
    .input('boleta', sql.NVarChar(300), boleta)
    .input('idTipoViatico', sql.Char(2), idTipoViatico)
    .input('idColaborador', sql.VarChar(20), idColaborador)
    .input('idEvento', sql.VarChar(10), idEvento)
    .execute('modificarViatico')
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

//Modificar estado viatico
router.put('/estado', (req, res) => {
  const idViatico = req.body.idViatico;
  const estadoViatico= req.body.estadoViatico;
  if (estadoViatico > 1 || estadoViatico < 0) return res.status(400).json({mensaje:"Debe insertar 1 o 0 para el estado"});
  if (!idViatico || !estadoViatico) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    .input('idViatico', sql.INT, idViatico)
    .input('estadoViatico', sql.INT, estadoViatico)
    .execute('modificarEstadoViatico')
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
//Vista para tener la suma de montos entre todos los viaticos realizados
router.get('/vista', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('vistaTotalViaticos')
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
