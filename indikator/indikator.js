const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");

// router.get('/all', async (req,res) =>{
//     try {
//         const result = await database.select("*").from('tb_indikator');
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

router.get('/all', async(req,res)=>{ 
    try { 
        const result = await database.raw(`SELECT tb_indikator.*, tb_device.id_jenis_device,tb_device.id_sektor,tb_device.nama_device,tb_device.deskripsi,tb_device.status FROM tb_indikator 
        LEFT OUTER JOIN tb_device on tb_device.id_device = tb_indikator.id_device`); 
        const hasil_data = result[0] 
        if(hasil_data.length > 0){ 
            var data_arry= []; 
            hasil_data.forEach(async row => { 
                var array_x = {}; 
                array_x['id_indikator'] = row.id_indikator
                array_x['id_device'] = row.id_device
                array_x['nama_indikator'] = row.nama_indikator
                array_x['stauan'] = row.stauan
                array_x['minimum'] = row.minimum
                array_x['maksimum'] = row.maksimum 
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

router.post('/simpan', validasi_data.data, verifikasi_validasi_data, async (req,res) =>{
    const data = req.body;
    const input = {
        ...data,
        status : "a"
    }
    try {
        const simpan = await database("tb_indikator").insert(input);
        if(simpan){
            return res.status(200).json({
                status : 1,
                message : "Berhasil",
                result : {
                    id_indikator : simpan[0],
                    ...input
                }
            })
        }else{
           return res.status(400).json({
               status : 0,
               message : "gagal simpan",
          })
        }   
    } catch (error) {
        return res.status(500).json({
            status : 0,
            message : error.message
        })
    }
});

router.put('/edit/:id_indikator',validasi_data.edit_data,verifikasi_validasi_data, async (req,res) =>{
    const data = req.body;
    try {
        const result = await database("tb_indikator").where('id_indikator',req.params.id_indikator).first();
        if (result){
            await database("tb_indikator").update(data).where('id_indikator',req.params.id_indikator);
            return res.status(200).json({
                status : 1,
                message : "Berhasil"
            })
        } else {
            return res.status(400).json({
                status : 0,
                message : "Data tidak ditemukan",
            })
        }
    } catch (error) {
        return res.status(500).json({
            status : 0,
            message : error.message
        });
    }
});

router.delete('/delete/:id_indikator', async (req,res) =>{
    try {
        const update = await database("tb_indikator").update("status", "t").where('id_indikator' ,req.params.id_indikator);
        if(update){
            return res.status(200).json({
                status :1,
                message : "berhasil",
            })
        }else{
           return res.status(400).json({
               status : 0,
               message : "gagal",
          })
        }   
    } catch (error) {
        return res.status(500).json({
            status : 0,
            message : error.message
        })
    }
});

router.get('/one/:id_jabatan', async(req,res)=>{
        try {
            const result = await database("tb_jabatan").select("*").where('id_jabatan' ,req.params.id_jabatan).first();
            if(result){
                return res.status(200).json({
                    status :1,
                    message : "berhasil",
                    result : result
                })
            }else{
               return res.status(400).json({
                   status : 0,
                   message : "data tidak ditemukan",
              })
            }
        } catch (error) {
            return res.status(500).json({
                status : 0,
                message : error.message
            })
        }
    });


module.exports = router;