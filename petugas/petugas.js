const express = require("express");
const router = express.Router();
const database = require("../config/database");
const bcrypt = require("bcrypt");
const upload = require("./multer");
const path = require("path");
const fs = require("fs");
const transporter = require("../config/email").transporter;
const jwt = require("jsonwebtoken");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");
const verifikasi_token = require("../middleware/verifikasi_token");
const { request } = require("https");

router.get('/', verifikasi_token, async (req, res) => {
    try {
        const result = await database
            .select(
                "petugas.id_petugas",
                "petugas.id_card",
                "petugas.nama_lengkap",
                "petugas.email",
                "petugas.no_tlp",
                "petugas.username",
                "jabatan.nama_jabatan",
                "role",
                "petugas.created_at",
            )
            .from('tb_petugas as petugas')
            .join('tb_jabatan as jabatan', 'petugas.id_jabatan', 'jabatan.id_jabatan')
            .where('petugas.status', 'a')
            .modify(function (queryBuilder) {
                if (req.query.cari) {
                    queryBuilder.where('petugas.nama_lengkap', 'like', `%${req.query.cari}%`)
                        .orWhere('petugas.email', 'like', `%${req.query.cari}%`)
                        .orWhere('petugas.no_tlp', 'like', `%${req.query.cari}%`)
                        .orWhere('petugas.username', 'like', `%${req.query.cari}%`)
                }
            }).paginate({
                perPage: parseInt(req.query.limit) || 5000,
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

router.get('/:id_petugas', verifikasi_token, async (req, res) => {
    try {
        const result = await database
            .select(
                "petugas.id_petugas",
                "petugas.id_card",
                "petugas.nama_lengkap",
                "petugas.email",
                "petugas.no_tlp",
                "petugas.foto",
                "petugas.username",
                "jabatan.id_jabatan",
                "jabatan.nama_jabatan",
                "petugas.role",
                "petugas.created_at",
            )
            .from('tb_petugas as petugas')
            .join('tb_jabatan as jabatan', 'petugas.id_jabatan', 'jabatan.id_jabatan')
            .where('petugas.status', 'a')
            .where('petugas.id_petugas', req.params.id_petugas)
            .first();

        if (result) {
            return res.status(200).json({
                status: 1,
                message: "Berhasil",
                result: result
            });
        } else {
            return res.status(404).json({
                status: 0,
                message: "Data tidak ditemukan"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

router.post('/', validasi_data.register, verifikasi_validasi_data, async (req, res) => {
    const data = req.body;
    try {
        const username = data.nama_lengkap.split(" ")[0].toLowerCase();
        const check_username = await database('tb_petugas')
            .where('username', username)
            .first();
        if (check_username) {
            const new_username = username + Math.floor(Math.random() * 100);
            data.username = new_username;
        } else {
            data.username = username;
        }

        const account = {
            username: data.username,
            password: Math.random().toString(36).slice(-8),
        }

        const createTb_petugas = {
            ...data,
            username: account.username,
            password: bcrypt.hashSync(account.password, 10),
            status: 'a',
            created_at: new Date(),
            updated_at: new Date()
        }
        const simpan = await database("tb_petugas").insert(createTb_petugas);

        if (simpan) {
            const mailOptions = {
                from: 'Electrical Monitoring',
                to: data.email,
                subject: "Register",
                html: `
                    <h1>Register</h1>
                    <p>Username: ${account.username}</p>
                    <p>Password: ${account.password}</p>
                    <br />
                    <p>Silahkan login ke aplikasi</p>
                `
            };

            transporter.sendMail(mailOptions, async (err, info) => {
                if (err) {
                    await database("tb_petugas").where("id_petugas", simpan[0]).del();

                    return res.status(500).json({
                        status: 0,
                        message: "Gagal mengirim email",
                        data: err
                    })
                } else {
                    console.log(info);
                    return res.status(201).json({
                        status: 1,
                        message: "Berhasil",
                        result: {
                            id_petugas: simpan[0],
                            ...createTb_petugas
                        }
                    })
                }
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        });
    }
});

router.delete('/:id_petugas', async (req, res) => {
    try {
        const data = {
            status: 't',
            updated_at: new Date()
        };
        const update = await database("tb_petugas").update(data).where('id_petugas', req.params.id_petugas);
        if (update) {
            return res.status(201).json({
                status: 1,
                message: "Berhasil",
            })
        } else {
            return res.status(400).json({
                status: 0,
                message: "Gagal",
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

router.put('/:id_petugas', upload.single('foto'), async (req, res) => {
    try {
        const data = req.body;
        data.updated_at = new Date();

        if (data.password) {
            data.password = bcrypt.hashSync(data.password, 10);
        }

        if (req.file) {
            const petugas = await database('tb_petugas').where('id_petugas', req.params.id_petugas).first();
            if (petugas.foto) {
                const img = path.join(__dirname, `../img/petugas/${petugas.foto}`);
                fs.unlinkSync(img);
            }
            const foto = req.file.filename;
            data.foto = foto;
        }

        await database("tb_petugas").update(data).where('id_petugas', req.params.id_petugas);
        return res.status(201).json({
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

// Get Foto
router.get('/image/:foto', async (req, res) => {
    try {
        const foto = req.params.foto;
        const img = path.join(__dirname, '../img/petugas/' + foto);
        if (fs.existsSync(img)) {
            return res.sendFile(img);
        } else {
            return res.status(404).json({
                status: 0,
                message: "Foto tidak ditemukan"
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

router.post('/login', validasi_data.login, verifikasi_validasi_data, async (req, res) => {
    const data = req.body;
    try {
        const result = await database('tb_petugas').where('username', data.username)
            .join('tb_jabatan', 'tb_petugas.id_jabatan', 'tb_jabatan.id_jabatan')
            .first();
        if (result) {
            const password = bcrypt.compareSync(data.password, result.password);
            if (password) {
                const token = jwt.sign({
                    id_petugas: result.id_petugas,
                    nama_lengkap: result.nama_lengkap,
                    username: result.username,
                    nama_jabatan: result.nama_jabatan,
                    foto: result.foto,
                    role: result.role
                }, "T0P_S3CR3t", { expiresIn: '1h' });

                await database('tb_petugas').update({
                    token: token,
                    updated_at: new Date()
                }).where('id_petugas', result.id_petugas);

                return res.status(200).json({
                    status: 1,
                    message: "Berhasil",
                    result: {
                        token: token
                    }
                });
            } else {
                return res.status(401).json({
                    status: 0,
                    message: "Username atau password salah"
                });
            }
        } else {
            return res.status(401).json({
                status: 0,
                message: "Username atau password salah"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const result = await database('tb_petugas').update({
            token: null,
            updated_at: new Date()
        }).where('token', token);

        if (result) {
            return res.status(200).json({
                status: 1,
                message: "Berhasil"
            });
        } else {
            return res.status(401).json({
                status: 0,
                message: "Gagal"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const data = req.body;
        const result = await database('tb_petugas').where('email', data.email).first();
        if (result) {
            const kode_verifikasi = Math.floor(100000 + Math.random() * 900000);

            // Assign to jwt token
            const token = jwt.sign({
                id_petugas: result.id_petugas,
                kode_verifikasi: kode_verifikasi
            }, "T0P_S3CR3t", { expiresIn: '1h' });

            // Simpan token ke database
            await database('tb_petugas').update({
                token: token,
                updated_at: new Date()
            }).where('id_petugas', result.id_petugas);

            // Kirim email
            const mailOptions = {
                from: '..',
                to: data.email,
                subject: 'Kode Verifikasi',
                html: `<h1>Kode Verifikasi</h1>
                <p>Kode verifikasi anda adalah <b>${kode_verifikasi}</b></p>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({
                        status: 0,
                        message: error.message
                    })
                } else {
                    return res.status(200).json({
                        status: 1,
                        message: "Berhasil"
                    });
                }
            });
        } else {
            return res.status(404).json({
                status: 0,
                message: "Email tidak ditemukan"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

// verifikasi
router.post('/verifikasi', async (req, res) => {
    try {
        const data = req.body;
        // cek token dengan yang ada di database
        const result = await database('tb_petugas').where('email', data.email).first();
        if (result) {
            const token = result.token;
            const decode = jwt.verify(token, "T0P_S3CR3t");
            if (decode.kode_verifikasi == data.code) {
                return res.status(200).json({
                    status: 1,
                    message: "Berhasil"
                });
            } else {
                return res.status(401).json({
                    status: 0,
                    message: "Kode verifikasi salah"
                });
            }
        } else {
            return res.status(401).json({
                status: 0,
                message: "Token tidak ditemukan"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const data = req.body;
        const result = await database('tb_petugas').where('email', data.email).first();
        if (result) {
            const password = bcrypt.hashSync(data.password, 10);
            await database('tb_petugas').update({
                password: password,
                updated_at: new Date()
            }).where('id_petugas', result.id_petugas);

            return res.status(200).json({
                status: 1,
                message: "Berhasil"
            });
        } else {
            return res.status(404).json({
                status: 0,
                message: "Email tidak ditemukan"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

// Verify Recaptcha
router.post('/verify-captcha', async (req, res) => {
    try {
        const data = req.body;
        const secretKey = '...';
        const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${data.response}`;

        request(verifyUrl, (err, response, body) => {
            body = JSON.parse(body);
            if (body.success !== undefined && !body.success) {
                return res.status(401).json({
                    status: 0,
                    message: "Failed captcha verification"
                });
            } else {
                return res.status(200).json({
                    status: 1,
                    message: "Success"
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});





module.exports = router;