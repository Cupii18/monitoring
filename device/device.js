const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");

router.get('/all', async (req,res) =>{
    try {
        const result = await database.select("*").from('tb_device');
        if(result.length > 0){
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


router.get('/jenis_device', async(req,res)=>{ 
    try { 
        const result = await database.raw(`SELECT tb_device.*, tb_jenis_device.nama_jenis, tb_jenis_device.keterangan, tb_jenis_device.status FROM tb_device
        LEFT OUTER JOIN tb_jenis_device on tb_jenis_device.id_jenis_device = tb_device.id_jenis_device`); 
        const hasil_data = result[0] 
        if(hasil_data.length > 0){ 
            var data_arry= []; 
            hasil_data.forEach(async row => { 
                var array_x = {}; 
                array_x['id_device'] = row.id_device
                array_x['id_jenis_device'] = row.id_jenis_device
                array_x['id_sektor'] = row.id_sektor
                array_x['nama_device'] = row.nama_device
                array_x['deskripsi'] = row.deskripsi
                array_x['status'] = row.status 
                array_x['nama_jenis'] = row.nama_jenis 
                array_x['keterangan'] = row.ketarangan
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


router.get('/sektor', async(req,res)=>{ 
    try { 
        const result = await database.raw(`SELECT tb_device.*, tb_sektor.nama_sektor, tb_sektor.deskripsi, tb_sektor.alamat FROM tb_device
        LEFT OUTER JOIN tb_sektor on tb_sektor.id_sektor = tb_device.id_sektor`); 
        const hasil_data = result[0] 
        if(hasil_data.length > 0){ 
            var data_arry= []; 
            hasil_data.forEach(async row => { 
                var array_x = {}; 
                array_x['id_device'] = row.id_device
                array_x['id_jenis_device'] = row.id_jenis_device
                array_x['id_sektor'] = row.id_sektor
                array_x['nama_device'] = row.nama_device
                array_x['deskripsi'] = row.deskripsi
                array_x['status'] = row.status 
                array_x['nama_sektor'] = row.nama_sektor
                array_x['alamat'] = row.alamat
 
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
        const simpan = await database("tb_device").insert(input);
        if(simpan){
            return res.status(200).json({
                status : 1,
                message : "Berhasil",
                result : {
                    id_device : simpan[0],
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

router.put('/edit/:id_device',validasi_data.edit_data,verifikasi_validasi_data, async (req,res) =>{
    const data = req.body;
    try {
        const result = await database("tb_device").where('id_device',req.params.id_device).first();
        if (result){
            await database("tb_device").update(data).where('id_device',req.params.id_device);
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

router.delete('/delete/:id_device', async (req,res) =>{
    try {
        const update = await database("tb_device").update("status", "t").where('id_device' ,req.params.id_device);
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

router.get('/one/:id_device', async(req,res)=>{
        try {
            const result = await database("tb_device").select("*").where('id_device' ,req.params.id_device).first();
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