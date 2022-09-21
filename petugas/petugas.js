const express = require("express");
const router = express.Router();
const database = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validasi_data =  require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");
const verifikasi_token = require("../middleware/verifikasi_token");
const nodemailer = require("nodemailer");

router.get('/all', async(req,res)=>{ 
    try { 
        const result = await database.raw(`SELECT tb_petugas.*, tb_jabatan.nama_jabatan,tb_jabatan.status FROM tb_petugas 
        LEFT OUTER JOIN tb_jabatan on tb_jabatan.id_jabatan = tb_petugas.id_jabatan`); 
        const hasil_data = result[0] 
        if(hasil_data.length > 0){ 
            var data_arry= []; 
            hasil_data.forEach(async row => { 
                var array_x = {}; 
                array_x['id_petugas'] = row.id_petugas
                array_x['id_jabatan'] = row.jabatan 
                array_x['nama_lengkap'] = row.nama_lengkap
                array_x['email'] = row.email 
                array_x['no_tlp'] = row.no_tlp 
                array_x['username'] = row.username
                array_x['password'] = row.password
                array_x['status'] = row.status 
                array_x['nama_jabatan'] = row.nama_jabatan
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

router.get('/profil/:id_petugas', async(req,res)=>{ 
    try { 
        const result = await database.raw(`SELECT tb_petugas.*, tb_jabatan.nama_jabatan,tb_jabatan.tatus FROM tb_petugas 
        LEFT OUTER JOIN tb_jabatan on tb_jabatan.id_jabatan = tb_petugas.id_jabatan 
        WHERE tb_petugas.id_petugas = '${req.params.id_petugas}'`); 
        const hasil_data = result[0][0] 
        if(hasil_data){ 
            return res.status(200).json({ 
                status : 1, 
                message : "berhasil", 
                result : hasil_data 
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

router.post('/register', validasi_data.register, verifikasi_validasi_data, async(req,res)=>{
    const data = req.body;
    try {
        const isNo_tlp = await database("tb_petugas").select("*").where('no_tlp', data.no_tlp).first();
        if(isNo_tlp) {
            return res.status(400).json({
                status : 0,
                message : "Telepon sudah ada"
            });
        }
        const isEmail = await database("tb_petugas").select("*").where('email', data.email).first();
        if(isEmail){
            return res.status(400).json({
                status : 0,
                message : "Email sudah ada"
            });
        }
        const createTb_petugas ={
            ...data,
            password : bcrypt.hashSync(data.password,14)
        }
        const simpan = await database("tb_petugas").insert(createTb_petugas);
        return res.status(200).json({
            status: 1,
            message : "Berhasil",
            result : {
                id_petugas : simpan[0],
                ...createTb_petugas
            }
        })
    } catch (error) {
        return res.status(500).json({
            status : 0,
            message : error.message
        });
    }
});

router.post('/login', validasi_data.login,verifikasi_validasi_data, async(req,res)=>{ 
    const data = req.body; 
    try { 
        const login = await database("tb_petugas").where('username',data.username).first(); 
        if(login){ 
            if(bcrypt.compareSync(data.password,login.password)){ 
                const access_token = jwt.sign({id_petugas : login.id_petugas}, "AKU PADAMU SELAMANYA",{expiresIn : '365d'});
                const token = jwt.sign({id_petugas : login.id_petugas}, "AKU PADAMU SELAMANYA",{expiresIn : '365d'});
                await database("tb_petugas").update('token',token).where('id_petugas', login.id_petugas);
                res.cookie('token', token,{
                    httpOnly : true
                })
                return res.status(200).json({ 
                    status :0, 
                    message : "selamat datang",
                    result : {
                        ...data
                    } 
                }) 
            }else{ 
                return res.status(400).json({ 
                    status :0, 
                    message : "password salah", 
                }) 
            } 
        }else{ 
            return res.status(400).json({ 
                status :0, 
                message : "username salah", 
            }) 
        } 
    } catch (error) { 
        return res.status(500).json({ 
            status : 0, 
            message : error.message 
        }) 
    } 
});

router.put('/lupa_password/:id_petugas', async(req,res)=>{
    const data = req.body;
    try {
        const kode = await database("tb_petugas").where('tb_petugas', req.params.id_petugas).first();
        if(kode){
            if(data.BaruPassword == data.verifikasiPassword){
               await database("tb_petugas").update('password',bcrypt.hashSync(data.verifikasiPassword,14)).where('id_petugas', kode.id_petugas);
               return res.status(200).json({
                status : 1,
                message : "Berhasil",
           })
            }else{
                return res.status(400).json({
                    status : 0,
                    message : "password tidak sama",
               })
            }
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

router.delete('/delete/:id_petugas', async (req,res) =>{
    try {
        const update = await database("tb_petugas").update("status", "t").where('id_petugas' ,req.params.id_petugas);
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


router.put('/profil/ganti_password/:id_petugas', async(req,res)=>{
    const data = req.body;
    try {
        const kode = await database("petugas").where('id_petugas', req.params.id_petugas).first();
        if(kode){
            if(data.BaruPassword === data.verifikasiPassword){
               await database("tb_petugas").update('password',bcrypt.hashSync(data.verifikasiPassword,14)).where('id_petugas',req.params.id_petugas);
               return res.status(200).json({
                status : 1,
                message : "Berhasil",
           })
            }else{
                return res.status(400).json({
                    status : 0,
                    message : "password tidak sama",
               })
            }
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

router.put('/profil/edit/:id_petugas', async(req,res)=>{
    const data = req.body;
    try {
        const isTelepon = await database("tb_petugas").select("*").where('telepon', data.telepon).first();
        if(isTelepon) {
            return res.status(400).json({
                status : 0,
                message : "Telepon sudah ada"
            });
        }
        const isEmail = await database("tb_petugas").select("*").where('email', data.email).first();
        if(isEmail){
            return res.status(400).json({
                status : 0,
                message : "Email sudah ada"
            });
        }

        await database("tb_petugas").update(data).where('id_petugas', req.params.id_petugas);
        return res.status(200).json({
            status : 1,
            message : "Berhasil"
        });
    } catch (error) {
        return res.status(500).json({
            status : 0,
            message : error.message
        })
    }
});



module.exports = router;