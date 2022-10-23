const express = require("express");
const router = express.Router();
const database = require("../config/database");

router.get('/', async (req, res) => {
    try {
        const result = await database
            .select('tb_device.nama_device', 'monitor_dc.waktu', 'monitor_dc.tegangan', 'monitor_dc.arus', 'monitor_dc.whatt', 'monitor_dc.kwh', 'tb_indikator.nama_indikator', 'tb_indikator.satuan')
            .from('monitor_dc')
            .join('tb_device', 'monitor_dc.id_device', 'tb_device.id_device')
            .join('tb_indikator', 'tb_device.id_device', 'tb_indikator.id_device')
            .join('tb_sektor', 'tb_device.id_sektor', 'tb_sektor.id_sektor')
            .modify(function (queryBuilder) {
                if (req.query.id_sektor) {
                    queryBuilder.where('tb_sektor.id_sektor', req.query.id_sektor)
                }

                if (req.query.id_device) {
                    queryBuilder.where('tb_device.id_device', req.query.id_device)
                }

                if (req.query.id_indikator) {
                    queryBuilder.where('tb_indikator.id_indikator', req.query.id_indikator)
                }
            })

        if (result) {
            return res.status(200).json({
                status: 1,
                message: "berhasil",
                result: result
            });
        } else {
            return res.status(400).json({
                status: 0,
                message: "data tidak ditemukan"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

// router.get('/all', async (req,res) =>{
//     try {
//         const result = await database.select("*").from('monitor_dc');
//         if(result.length > 0){
//             return res.status(200).json({
//                 status :1,
//                 message : "berhasil",
//                 result : result
//             })
//         }else{
//            return res.status(400).json({
//                status : 0,
//                message : "data tidak ditemukan",
//           })
//         }   
//     } catch (error) {
//         return res.status(500).json({
//             status : 0,
//             message : error.message
//         })
//     }
// });

module.exports = router;