const express = require("express");
const router = express.Router();
const database = require("../config/database");
const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");
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
                "role.nama_role as role",
                "petugas.created_at",
            )
            .from('tb_petugas as petugas')
            .join('tb_jabatan as jabatan', 'petugas.id_jabatan', 'jabatan.id_jabatan')
            .join('tb_role as role', 'petugas.id_role', 'role.id_role')
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

router.get('/:id_petugas', async (req, res) => {
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
                "jabatan.id_jabatan",
                "jabatan.nama_jabatan",
                "role.id_role",
                "role.nama_role",
                "petugas.created_at",
            )
            .from('tb_petugas as petugas')
            .join('tb_jabatan as jabatan', 'petugas.id_jabatan', 'jabatan.id_jabatan')
            .join('tb_role as role', 'petugas.id_role', 'role.id_role')
            .where('petugas.status', 'a')
            .where('petugas.id_petugas', req.params.id_petugas)
            .first();

        if (result) {
            return res.status(200).json({
                status: 1,
                message: "berhasil",
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
    created_at
    try {
        const createTb_petugas = {
            ...data,
            password: bcrypt.hashSync(data.password, 14),
            status: 'a',
            created_at: new Date(),
            updated_at: new Date()
        }
        const simpan = await database("tb_petugas").insert(createTb_petugas);

        return res.status(201).json({
            status: 1,
            message: "Berhasil",
            result: {
                id_petugas: simpan[0],
                ...createTb_petugas
            }
        })
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
                message: "berhasil",
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

router.put('/:id_petugas', async (req, res) => {
    const data = req.body;
    data.updated_at = new Date();
    try {
        data.updated_at = new Date();
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



module.exports = router;