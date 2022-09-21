const express = require("express");
const router = express.Router();
const database = require("../config/database");

router.get('/all', async(req,res)=>{ 
    try { 
        const result = await database.raw(`SELECT monitor_dc.*, tb_device.id_jenis_device,tb_device.id_sektor,tb_device.nama_device,tb_device.deskripsi,tb_device.status FROM monitor_dc 
        LEFT OUTER JOIN tb_device on tb_device.id_device = monitor_dc.id_device`); 
        const hasil_data = result[0] 
        if(hasil_data.length > 0){ 
            var data_arry= []; 
            hasil_data.forEach(async row => { 
                var array_x = {}; 
                array_x['no'] = row.no 
                array_x['id_device'] = row.id_device
                array_x['tegangan'] = row.tegangan 
                array_x['arus'] = row.arus
                array_x['whatt'] = row.whatt 
                array_x['kwh'] = row.kwh 
                array_x['waktu'] = row.wkatu 
                array_x['status'] = row.status 
                array_x['id_jenis_device'] = row.id_jenis_device
                array_x['id_sektor'] = row.id_sektor
                array_x['nama_device'] = row.nama_device
                array_x['deskripsi'] = row.deskripsi
                array_x['status'] = row.status
 
                data_arry.push(array_x); 
            }); 
            return res.status(200).json({ 
                status : 1, 
                message : "berhasil", 
                result : data_arry 
            }); 
        }else{ 
            return res.status(400).json({ 
                status : 0, 
                message : "data tidak ditemukan" 
            }); 
        } 
    } catch (error) { 
        return res.status(500).json({ 
            status : 0, 
            message : error.message 
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