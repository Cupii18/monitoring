const express = require("express");
const router = express.Router();
const database = require("../config/database");

router.get('/all', async (req,res) =>{
    try {
        const result = await database.select("*").from('monitoring');
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

router.get('/all/:sensor', async (req,res) =>{
    try {
        const result = await database("monitoring").select("*").where('sensor' ,req.params.sensor).first();
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