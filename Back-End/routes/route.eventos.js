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


//Insertar eventos
router.post('/', (req, res) => {
  const idEvento= req.body.idEvento;
  const resuelveProblema= req.body.resuelveProblema;
  const trabajoRealizado= req.body.trabajoRealizado;
  const problemaReportado= req.body.problemaReportado;
  const horas= req.body.horas;
  const minutos= req.body.minutos;
  const duracion= req.body.duracion;
  const fecha= req.body.fecha;
  const idSucursal= req.body.idSucursal;
  const idLabor= req.body.idLabor;
  const idMotivo= req.body.idMotivo;
  const idTipoSoporte= req.body.idTipoSoporte;
  const idCentroCosto= req.body.idCentroCosto;
  const idColaborador = req.body.idColaborador;
  if (!idEvento || !resuelveProblema || !trabajoRealizado || !problemaReportado || !horas || !minutos
  || !duracion || !fecha || !idSucursal || !idLabor || !idMotivo || !idTipoSoporte ||
   !idCentroCosto || !idColaborador ){

      return res.status(400).json({mensaje:'Falta datos'});

  }

  routePool.connect().then(pool => {
    return pool.request()
    .input('idEvento', sql.VARCHAR(10), idEvento)
    .input('resuelveProblema', sql.INT, resuelveProblema)
    .input('trabajoRealizado', sql.NVarChar(300), trabajoRealizado)
    .input('problemaReportado', sql.NVarChar(300), problemaReportado)
    .input('horas', sql.INT, horas)
    .input('minutos', sql.INT, minutos)
    .input('duracion', sql.DECIMAL(10,2), duracion)
    .input('fecha', sql.Char(10), fecha)
    .input('idSucursal', sql.INT, idSucursal)
    .input('idLabor', sql.CHAR(3), idLabor)
    .input('idMotivo', sql.CHAR(3), idMotivo)
    .input('idTipoSoporte', sql.Char(1), idTipoSoporte)
    .input('idCentroCosto', sql.Char(8), idCentroCosto)
    .input('idColaborador', sql.VarChar(20), idColaborador)
    //.ouput       -------------- para obtener el error desde base de datos
    .execute('ingresoEventos')
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

//Obtener eventos
router.get('/', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('obtenerEventos')
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

//Modificar eventos
router.put('/', (req, res) => {
  const idEvento= req.body.idEvento;
  const resuelveProblema= req.body.resuelveProblema;
  const trabajoRealizado= req.body.trabajoRealizado;
  const problemaReportado= req.body.problemaReportado;
  const horas= req.body.horas;
  const minutos= req.body.minutos;
  const duracion= req.body.duracion;
  const fecha= req.body.fecha;
  const idSucursal= req.body.idSucursal;
  const idLabor= req.body.idLabor;
  const idMotivo= req.body.idMotivo;
  const idTipoSoporte= req.body.idTipoSoporte;
  const idCentroCosto= req.body.idCentroCosto;
  const idColaborador = req.body.idColaborador;
  if (!idEvento || !resuelveProblema || !trabajoRealizado || !problemaReportado || !horas || !minutos
  || !duracion || !fecha || !idSucursal || !idLabor || !idMotivo || !idTipoSoporte ||
   !idCentroCosto || !idColaborador ) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool => {
  routePool.connect().then(pool => {
    return pool.request()
    //  .input('cedula',req.params.cedula)
    .input('idEvento', sql.VARCHAR(10), idEvento)
    .input('resuelveProblema', sql.INT, resuelveProblema)
    .input('trabajoRealizado', sql.NVarChar(300), trabajoRealizado)
    .input('problemaReportado', sql.NVarChar(300), problemaReportado)
    .input('horas', sql.INT, horas)
    .input('minutos', sql.INT, minutos)
    .input('duracion', sql.DECIMAL(10,2), duracion)
    .input('fecha', sql.Char(10), fecha)
    .input('idSucursal', sql.INT, idSucursal)
    .input('idLabor', sql.CHAR(3), idLabor)
    .input('idMotivo', sql.Char(3), idMotivo)
    .input('idTipoSoporte', sql.Char(1), idTipoSoporte)
    .input('idCentroCosto', sql.Char(8), idCentroCosto)
    .input('idColaborador', sql.VarChar(20), idColaborador)
    .execute('modificarEventos')
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

//Modificar estado eventos
router.put('/estado', (req, res) => {
  const idEvento= req.body.idEvento;
  const estadoEventos= req.body.estadoEventos;
  if (estadoEventos > 1 || estadoEventos < 0) return res.status(400).json({mensaje:"Debe insertar 1 o 0 para el estado"});
  if (!idEvento || !estadoEventos) return res.status(400).json({mensaje:"Faltan datos"});
  // sql.connect(conn).then(pool =>
  routePool.connect().then(pool => {
    return pool.request()
    //  .input('cedula',req.params.cedula)
    .input('idEvento', sql.VARCHAR(10), idEvento)
    .input('estadoEventos', sql.INT, estadoEventos)
    .execute('modificarEstadoEventos')
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

//Cursor eventos
router.get('/cursor', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('cursorEventos')
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


//Consulta
//Obtener info de los eventos ordenado por fecha
router.get('/consultaInfo', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('infoEventosFecha')
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

//Consulta
//Obtener la cantidad de problemas resueltos en los eventos
router.get('/consultaProblemas', (req, res) => {
  routePool.connect().then(pool => {
    return pool.request()
    .execute('cantProblemasResueltos')
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
