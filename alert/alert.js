const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");


router.get('/', async (req,res) =>{
    try {
        const result = await database
        .select(
            "alert.id_alert",
            "alert.nama_alert",
            "alert.kondisi",
            "alert.interval",
            "alert.status",
            "alert.tanggal",
            "device.nama_device",
            "jenis_device.nama_jenis"
        )
        .from('tb_alert as alert')
        .leftJoin('tb_device as device', 'alert.id_device', 'device.id_device')
        .leftJoin('tb_jenis_device as jenis_device', 'device.id_jenis_device', 'jenis_device.id_jenis_device')
        .where('alert.status', 'a')
        .modify(function (queryBuilder) {
            if (req.query.cari) {
                queryBuilder.where('alert.nama_alert', 'like', '%' + req.query.cari + '%')
                    .orWhere('device.nama_device', 'like', '%' + req.query.cari + '%')
                    .orWhere('jenis_device.nama_jenis', 'like', '%' + req.query.cari + '%')
            }
        })
        .paginate({
            perPage: req.query.limit || null,
            currentPage: req.query.page || null,
            isLengthAware: true
        });
        return res.status(200).json({
            status: 1,
            message: "Berhasil",
            result: result.data,
            per_page: result.pagination.perPage,
            total_pages: req.query.limit ? result.pagination.to : null,
            total_data: req.query.limit ? result.pagination.total : null
        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

// router.get('/device', async(req,res)=>{ 
//     try { 
//         const result = await database.raw(`SELECT tb_alert.*, tb_device.id_jenis_device,tb_device.id_sektor,tb_device.nama_device,tb_device.deskripsi,tb_device.status FROM tb_alert 
//         LEFT OUTER JOIN tb_device on tb_device.id_device = tb_alert.id_device`); 
//         const hasil_data = result[0] 
//         if(hasil_data.length > 0){ 
//             var data_arry= []; 
//             hasil_data.forEach(async row => { 
//                 var array_x = {}; 
//                 array_x['id_petugas'] = row.id_petugas
//                 array_x['id_device'] = row.id_device
//                 array_x['nama_alert'] = row.nama_alert
//                 array_x['kondisi'] = row.kondisi
//                 array_x['interval'] = row.interval
//                 array_x['status'] = row.status 
//                 array_x['tanggal'] = row.tanggal 
//                 array_x['id_jenis_device'] = row.id_jenis_device
//                 array_x['id_sektor'] = row.id_sektor
//                 array_x['nama_device'] = row.nama_device
//                 array_x['deskripsi'] = row.deskripsi
//                 array_x['status'] = row.status
 
//                 data_arry.push(array_x); 
//             }); 
//             return res.status(200).json({ 
//                 status : 1, 
//                 message : "berhasil", 
//                 result : data_arry 
//             }); 
//         }else{ 
//             return res.status(400).json({ 
//                 status : 0, 
//                 message : "data tidak ditemukan" 
//             }); 
//         } 
//     } catch (error) { 
//         return res.status(500).json({ 
//             status : 0, 
//             message : error.message 
//         }) 
//     } 
// });


// router.get('/petugas', async(req,res)=>{ 
//     try { 
//         const result = await database.raw(`SELECT tb_alert.*, tb_petugas.id_jabatan, tb_petugas.nama_lengkap, tb_petugas.email, tb_petugas.no_tlp, tb_petugas.status FROM tb_alert 
//         LEFT OUTER JOIN tb_petugas on tb_petugas.id_petugas = tb_alert.id_petugas`); 
//         const hasil_data = result[0] 
//         if(hasil_data.length > 0){ 
//             var data_arry= []; 
//             hasil_data.forEach(async row => { 
//                 var array_x = {}; 
//                 array_x['id_petugas'] = row.id_petugas
//                 array_x['id_device'] = row.id_device
//                 array_x['nama_alert'] = row.nama_alert
//                 array_x['kondisi'] = row.kondisi
//                 array_x['interval'] = row.interval
//                 array_x['status'] = row.status 
//                 array_x['tanggal'] = row.tanggal 
//                 array_x['id_jabatan'] = row.id_jabatan
//                 array_x['nama_lengkap'] = row.nama_lengkap
//                 array_x['email'] = row.email
//                 array_x['no_tlp'] = row.no_tlp
//                 array_x['status'] = row.status
 
//                 data_arry.push(array_x); 
//             }); 
//             return res.status(200).json({ 
//                 status : 1, 
//                 message : "berhasil", 
//                 result : data_arry 
//             }); 
//         }else{ 
//             return res.status(400).json({ 
//                 status : 0, 
//                 message : "data tidak ditemukan" 
//             }); 
//         } 
//     } catch (error) { 
//         return res.status(500).json({ 
//             status : 0, 
//             message : error.message 
//         }) 
//     } 
// });


router.post('/simpan', validasi_data.data, verifikasi_validasi_data, async (req,res) =>{
    const data = req.body;
    const input = {
        ...data,
        status : "a"
    }
    try {
        const simpan = await database("tb_alert").insert(input);
        if(simpan){
            return res.status(200).json({
                status : 1,
                message : "Berhasil",
                result : {
                    id_alert : simpan[0],
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

router.put('/edit/:id_alert',validasi_data.edit_data,verifikasi_validasi_data, async (req,res) =>{
    const data = req.body;
    try {
        const result = await database("tb_alert").where('id_alert',req.params.id_alert).first();
        if (result){
            await database("tb_alert").update(data).where('id_alert',req.params.id_alert);
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

router.delete('/delete/:id_alert', async (req,res) =>{
    try {
        const update = await database("tb_alert").update("status", "t").where('id_alert' ,req.params.id_alert);
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

router.get('/one/:id_alert', async(req,res)=>{
        try {
            const result = await database("tb_alert").select("*").where('id_alert' ,req.params.id_alert).first();
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