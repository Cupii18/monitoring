const express = require("express");
const router = express.Router();
const database = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifikasi_token = require("../middleware/verifikasi_token");

router.get('/all', verifikasi_token, async(req,res)=>{
    try {
        const result = await database.select("*").from('petugas');
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

// router.get('/one/:id_petugas', async(req,res)=>{
//     try {
//         const result = await database("petugas").select("*").where('id_petugas' ,req.params.id_).first();
//         if(result){
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

// router.post('/register', async(req,res)=>{
//     const data = req.body;
//     try {
//         const username = await database("petugas").where('username', data.username).first();
//         if (username) {
//             return res.status(400).json({
//                 status : 0,
//                 message : "username sudah ada"
//             })
//         } else {
//             const create = {
//                 username : data.username,
//                 password : bcrypt.hashSync(data.password,12)
//             }
//             const simpan = await database("petugas").insert(create);
//             return res.status(200).json({
//                 status : 1,
//                 message : "Berhasil",
//                 result : {
//                     id_petugas : simpan[0],
//                     ...create
//                 }
//             })
//         }
//     } catch (error) {
//         return res.status(500).json({
//             status : 0,
//             message : error.message
//         })
//     }
// });

router.post('/login', async(req,res)=>{
    const data = req.body;
    try {
        const login = await database("petugas").where('username', data.username).first();
        if(login){
            if(bcrypt.compareSync(data.password, login.password)){
                const access_token = jwt.sign({id_petugas : login.id_petugas}, "AKU PADAMU SELAMANYA",{expiresIn : '50s'});
                const refresh_token = jwt.sign({id_petugas : login.id_petugas}, "AKU PADAMU SELAMANYA",{expiresIn : '7d'});
                await database("petugas").update('refresh_token',refresh_token).where('id_petugas', login.id_petugas);
                res.cookie('refresh_token', refresh_token,{
                    httpOnly : true
                })
                return res.status(200).json({
                    status :  1,
                    message : "Selamat datang",
                    token : access_token
                })
            }else{
                return res.status(400).json({
                    status : 0,
                    message : "password salah"
                })
            }
        }else{
            return res.status(400).json({
                status : 0,
                message : "username salah"
            })
        }
    } catch (error) {
        return res.status(500).json({
            status : 0,
            message : error.message
        })
    }
});

// router.get('/refresh_token', async(req,res)=>{
//     try { 
//         const token = req.cookies.refresh_token;
//         if(!token){
//             return res.status(400).json({
//                 status : 0,
//                 message : "Tidak ada token"
//             })
//         }
//         const cek_token = await database("petugas").where('refresh_token',token).first();
//         if(cek_token){
//             jwt.verify(token, "AKU PADAMU SELAMANYA", async(err,decoded) =>{
//                 if(err){
//                     return res.status(400).json({
//                         status : 0,
//                         message : "Token invalid",
//                         error :  err.message
//                     })
//                 }
//                 const access_token = jwt.decode({id_petugas : decoded.id_petugas}, "AKU PADAMU SELAMANYA",{expiresIn : '50s'});
//                 const refresh_token = jwt.decode({id_petugas : decoded.id_petugas}, "AKU PADAMU SELAMANYA",{expiresIn : '7d'});
//                 await database("petugas").update('refresh_token',refresh_token).where('id_petugas', decoded.id_petugas);
//                 res.cookie('refresh_token', refresh_token,{
//                     httpOnly : true
//                 })
//                 return res.status(200).json({
//                     status :  1,
//                     message : "Token sudah diperbarui",
//                     token : access_token
//                 })
//             });
//         }else{
//             return res.status(400).json({
//                 status : 0,
//                 message : "Token tidak ditemukan"
//             })
//         }
//     } catch (error) {
//         return res.status(500).json({
//             status : 0,
//             message : error.message
//         })
//     }
// });

// router.put('/lupa_password/:id_petugas', async(req,res)=>{
//     const data = req.body;
//     try {
//         const password = await database("user").where('password', req.params.password).first();
//         if(password){
//             if(data.NewPassword == data.verifikasiPassword){
//                await database("petugas").update('password',bcrypt.hashSync(data.verifikasiPassword,14)).where('id_petugas', kode.id_petugas);
//                return res.status(200).json({
//                 status : 1,
//                 message : "Berhasil",
//            })
//             }else{
//                 return res.status(400).json({
//                     status : 0,
//                     message : "password tidak sama",
//                })
//             }
//         }else{
//             return res.status(400).json({
//                 status : 0,
//                 message : "data tidak ditemukan",
//            })
//         }
//     } catch (error) {
//         return res.status(500).json({
//             status : 0,
//             message : error.message
//         })
//     }
// });

module.exports = router;

