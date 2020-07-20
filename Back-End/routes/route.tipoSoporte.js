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


module.exports = router;
