const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");

router.get('/all', async (req,res) =>{
    try {
        const result = await database.select("*").from('tb_sektor');
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
        status: "a"
    }
    try {
        const simpan = await database("tb_sektor").insert(input);
        if(simpan){
            return res.status(200).json({
                status : 1,
                message : "Berhasil",
                result : {
                    id_sektor : simpan[0],
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

router.put('/edit/:id_sektor',validasi_data.edit_data,verifikasi_validasi_data, async (req,res) =>{
    const data = req.body;
    try {
        const result = await database("tb_sektor").where('id_sektor',req.params.id_sektor).first();
        if (result){
            await database("tb_sektor").update(data).where('id_sektor',req.params.id_sektor);
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

router.delete('/delete/:id_sektor', async (req,res) =>{
    try {
        const update = await database("tb_sektor").update("status", "t").where('id_sektor' ,req.params.id_sektor);
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

router.get('/one/:id_sektor', async(req,res)=>{
    try {
        const result = await database("tb_sektor").select("*").where('id_sektor' ,req.params.id_sektor).first();
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