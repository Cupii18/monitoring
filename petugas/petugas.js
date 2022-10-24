const express = require("express");
const router = express.Router();
const database = require("../config/database");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const validasi_data = require("./validasi_data");
// const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");
// const verifikasi_token = require("../middleware/verifikasi_token");
// const nodemailer = require("nodemailer");

router.get('/', async (req, res) => {
    try {
        const result = await database
            .select(
                "petugas.id_petugas",
                "petugas.id_card",
                "petugas.nama_lengkap",
                "petugas.email",
                "petugas.no_tlp",
                "petugas.username",
                "petugas.password",
                "jabatan.nama_jabatan",
            )
            .from('tb_petugas as petugas')
            .join('tb_jabatan as jabatan', 'petugas.id_jabatan', 'jabatan.id_jabatan')
            .where('petugas.status', 'a')
            .modify(function (queryBuilder) {
                if (req.query.cari) {
                    queryBuilder.where('petugas.nama_lengkap', 'like', '%' + req.query.cari + '%')
                        .orWhere('petugas.email', 'like', '%' + req.query.cari + '%')
                        .orWhere('petugas.no_tlp', 'like', '%' + req.query.cari + '%')
                        .orWhere('petugas.username', 'like', '%' + req.query.cari + '%')
                }
            })
            .paginate({
                perPage: parseInt(req.query.limit) || null,
                currentPage: req.query.page || null,
                isLengthAware: true
            });

        return res.status(200).json({
            status: 1,
            message: "Berhasil",
            result: result.data,
            per_page: result.pagination.perPage,
            total_pages: req.query.limit ? result.pagination.to : null,
            total_data: req.query.limit ? result.pagination.total : null,
        })

    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

router.get('/:id_petugas', async (req, res) => {
    try {
        const result = await database.raw(`SELECT tb_petugas.*, tb_jabatan.nama_jabatan,tb_jabatan.tatus FROM tb_petugas 
        LEFT OUTER JOIN tb_jabatan on tb_jabatan.id_jabatan = tb_petugas.id_jabatan 
        WHERE tb_petugas.id_petugas = '${req.params.id_petugas}'`);
        const hasil_data = result[0][0]
        if (hasil_data) {
            return res.status(200).json({
                status: 1,
                message: "berhasil",
                result: hasil_data
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

// router.post('/register', validasi_data.register, verifikasi_validasi_data, async (req, res) => {
//     const data = req.body;
//     try {
//         const isNo_tlp = await database("tb_petugas").select("*").where('no_tlp', data.no_tlp).first();
//         if (isNo_tlp) {
//             return res.status(400).json({
//                 status: 0,
//                 message: "Telepon sudah ada"
//             });
//         }
//         const isEmail = await database("tb_petugas").select("*").where('email', data.email).first();
//         if (isEmail) {
//             return res.status(400).json({
//                 status: 0,
//                 message: "Email sudah ada"
//             });
//         }
//         const createTb_petugas = {
//             ...data,
//             password: bcrypt.hashSync(data.password, 14)
//         }
//         const simpan = await database("tb_petugas").insert(createTb_petugas);
//         return res.status(201).json({
//             status: 1,
//             message: "Berhasil",
//             result: {
//                 id_petugas: simpan[0],
//                 ...createTb_petugas
//             }
//         })
//     } catch (error) {
//         return res.status(500).json({
//             status: 0,
//             message: error.message
//         });
//     }
// });

// router.post('/login', validasi_data.login, verifikasi_validasi_data, async (req, res) => {
//     const data = req.body;
//     try {
//         const login = await database("tb_petugas").where('username', data.username).first();
//         if (login) {
//             if (bcrypt.compareSync(data.password, login.password)) {
//                 const token = jwt.sign({ id_petugas: login.id_petugas }, "AKU PADAMU SELAMANYA", { expiresIn: '365d' });
//                 await database("tb_petugas").update('token', token).where('id_petugas', login.id_petugas);
//                 res.cookie('token', token, {
//                     httpOnly: true
//                 })
//                 return res.status(200).json({
//                     status: 0,
//                     message: "selamat datang",
//                     result: {
//                         ...data
//                     }
//                 })
//             } else {
//                 return res.status(400).json({
//                     status: 0,
//                     message: "password salah",
//                 })
//             }
//         } else {
//             return res.status(400).json({
//                 status: 0,
//                 message: "username salah",
//             })
//         }
//     } catch (error) {
//         return res.status(500).json({
//             status: 0,
//             message: error.message
//         })
//     }
// });

// router.put('/lupa_password/:id_petugas', async (req, res) => {
//     const data = req.body;
//     try {
//         const kode = await database("tb_petugas").where('tb_petugas', req.params.id_petugas).first();
//         if (kode) {
//             if (data.BaruPassword == data.verifikasiPassword) {
//                 await database("tb_petugas").update('password', bcrypt.hashSync(data.verifikasiPassword, 14)).where('id_petugas', kode.id_petugas);
//                 return res.status(200).json({
//                     status: 1,
//                     message: "Berhasil",
//                 })
//             } else {
//                 return res.status(400).json({
//                     status: 0,
//                     message: "password tidak sama",
//                 })
//             }
//         } else {
//             return res.status(400).json({
//                 status: 0,
//                 message: "data tidak ditemukan",
//             })
//         }
//     } catch (error) {
//         return res.status(500).json({
//             status: 0,
//             message: error.message
//         })
//     }
// });

router.delete('/:id_petugas', async (req, res) => {
    try {
        const update = await database("tb_petugas").update("status", "t").where('id_petugas', req.params.id_petugas);
        if (update) {
            return res.status(200).json({
                status: 1,
                message: "berhasil",
            })
        } else {
            return res.status(400).json({
                status: 0,
                message: "gagal",
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});


// router.put('/profil/ganti_password/:id_petugas', async (req, res) => {
//     const data = req.body;
//     try {
//         const kode = await database("petugas").where('id_petugas', req.params.id_petugas).first();
//         if (kode) {
//             if (data.BaruPassword === data.verifikasiPassword) {
//                 await database("tb_petugas").update('password', bcrypt.hashSync(data.verifikasiPassword, 14)).where('id_petugas', req.params.id_petugas);
//                 return res.status(200).json({
//                     status: 1,
//                     message: "Berhasil",
//                 })
//             } else {
//                 return res.status(400).json({
//                     status: 0,
//                     message: "password tidak sama",
//                 })
//             }
//         } else {
//             return res.status(400).json({
//                 status: 0,
//                 message: "data tidak ditemukan",
//             })
//         }
//     } catch (error) {
//         return res.status(500).json({
//             status: 0,
//             message: error.message
//         })
//     }
// });

router.put('/:id_petugas', async (req, res) => {
    const data = req.body;
    try {
        const isTelepon = await database("tb_petugas").select("*").where('telepon', data.telepon).first();
        if (isTelepon) {
            return res.status(400).json({
                status: 0,
                message: "Telepon sudah ada"
            });
        }
        const isEmail = await database("tb_petugas").select("*").where('email', data.email).first();
        if (isEmail) {
            return res.status(400).json({
                status: 0,
                message: "Email sudah ada"
            });
        }

        await database("tb_petugas").update(data).where('id_petugas', req.params.id_petugas);
        return res.status(200).json({
            status: 1,
            message: "Berhasil"
        });
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});



module.exports = router;