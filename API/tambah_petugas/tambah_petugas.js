const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");

router.get('/all', async (req,res) =>{
    try {
        const result = await database.select("*").from('tambah_petugas');
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

router.post('/simpan', validasi_data.data, verifikasi_validasi_data, async (req,res) =>{
    const data = req.body;
    const input = {
        ...data,
        status: "on"
    }
    try {
        const simpan = await database("tambah_petugas").insert(input);
        if(simpan){
            return res.status(200).json({
                status : 1,
                message : "Berhasil",
                result : {
                    id_add : simpan[0],
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

router.put('/edit/:id_add',validasi_data.edit_data,verifikasi_validasi_data, async (req,res) =>{
    const data = req.body;
    try {
        const result = await database("tambah_petugas").where('id_add',req.params.id_add).first();
        if (result){
            await database("tambah_petugas").update(data).where('id_add',req.params.id_add);
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

router.delete('/delete/:id_add', async (req,res) =>{
    try {
        const update = await database("tambah_petugas").update("status", "on").where('id_add' ,req.params.id_add);
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


module.exports = router;