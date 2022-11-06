// const express = require("express");
// const moment = require("moment/moment");
// const router = express.Router();
// const database = require("../config/database");

// function SocketRouter(io) {

//     const router = express.Router();

//     router.get('/', async (req, res) =>{
//         try{
//             const result = await database
//                 .select(
//                     database.raw('CONCAT(tb_device.nama_device, "-", tb_jenis_device.nama_device) as name'),
//                     'tb_device.id_device'
//                 )
//                 .from('monitor_dc')
//                 .join('tb_device', 'monitor_dc.id_device', 'tb_device.id_device')
//                 .join('tb_jenis_device', 'tb_jenis_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
//                 .join('tb_indikator', 'tb_device.id_indikator', 'tb_indikator.id_device')
//                 .join('tb_sektor', 'tb_device.id_sektor', 'tb_sektor.id_sektor')
//                 .oderBy('monitor_dc.id_monitor_dc', 'desc')
//                 .grupBy('tb_indikator.id_indikator')
//                 .limit(100)
//                 .modify(function (queryBuilder) {
//                     if (req.query.indikator) {
//                         if (req.query.indikator != 'all') {
//                             queryBuilder.where('tb_indikator.nama_indikator', req.query.indikator);
//                         }
//                     }
//                     if (req.query.jenis_device) {
//                         if (req.query.jenis_device != 'all') {
//                             queryBuilder.where('tb_jenis_device.id_jenis_device', req.query.jenis_device);
//                         }
//                     }
//                     if (req.query.indikator) {
//                         if (req.query.sektor != 'all') {
//                             queryBuilder.where('tb_sektor.nama_sektor', req.query.sektor);
//                         }
//                     }
//                 })

//             for ( let i = 0; i < result.length; i++) {
//                 const data = await database
//                     .select(
//                         'monitordc.arus',
//                         'monitordc.tegangan',
//                         'monitordc.watt',
//                         'monitordc.kwh',
//                         'monitordc.waktu',
//                     )
//                     .from('monitor_dc')
//                     .join('tb_device', 'monitor_dc.id_device', 'tb_device.id_device')
//                     .join('tb_jenis_device', 'tb_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
//                     .where('tb_device.id_device', result[i].id_device)
//                     .grupByRaw('DATE_FORMAT(waktu, %Y-%m-% %H)')
//                     .oderBy('monitor_dc.id_monitor_dc', 'desc')
//                     .limit(100)

//                     if (data) {
//                         result[i].data = data
//                     }
//                 }
                
//                 if(result) {
//                     io.emit('monitor_dc', result)

//                     return res.status(200).json({
//                         status: 1,
//                         message: "Berhasil",
//                         result: result
//                     });
//                 } else {
//                     return res.status(400).json({
//                         status:0,
//                         message: "Data tidak ditemukan"
//                     })
//                 }
//             } catch (error) {
//                 return res.status(500).json({
//                   status: 0,
//                   message: error.message
//                 })
//               }
//             });
          
//             return router;
//         }
          
//           module.exports = SocketRouter;