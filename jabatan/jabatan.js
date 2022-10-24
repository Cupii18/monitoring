const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");

router.get('/', async (req, res) => {
    try {
        const result = await database
            .select("*")
            .from('tb_jabatan')
            .where('status', 'a')
            .modify(function (queryBuilder) {
                if (req.query.cari) {
                    queryBuilder.where('nama_jabatan', 'like', `%${req.query.cari}%`)
                }
            }).paginate({
                perPage: req.query.limit || null,
                currentPage: req.query.page || null,
                isLengthAware: true,
            });

        if (result.data.length > 0) {
            return res.status(200).json({
                status: 1,
                message: "Berhasil",
                result: result.data,
                per_page: result.pagination.perPage,
                total_pages: req.query.limit ? result.pagination.to : null,
                total_data: req.query.limit ? result.pagination.total : null,
            })
        } else {
            return res.status(200).json({
                status: 0,
                message: "data tidak ditemukan",
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

router.post('/', validasi_data.data, verifikasi_validasi_data, async (req, res) => {
    const data = req.body;
    const input = {
        ...data,
        status: "a"
    }
    try {
        const simpan = await database("tb_jabatan").insert(input);
        if (simpan) {
            return res.status(200).json({
                status: 1,
                message: "Berhasil",
                result: {
                    id_jabatan: simpan[0],
                    ...input
                }
            })
        } else {
            return res.status(422).json({
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

router.put('/:id_jabatan', validasi_data.edit_data, verifikasi_validasi_data, async (req, res) => {
    const data = req.body;
    try {
        const result = await database("tb_jabatan").where('id_jabatan', req.params.id_jabatan).first();
        if (result) {
            await database("tb_jabatan").update(data).where('id_jabatan', req.params.id_jabatan);
            return res.status(200).json({
                status: 1,
                message: "Berhasil"
            })
        } else {
            return res.status(422).json({
                status: 0,
                message: "Gagal, data tidak ditemukan",
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        });
    }
});

router.delete('/:id_jabatan', async (req, res) => {
    try {
        const update = await database("tb_jabatan").update("status", "t").where('id_jabatan', req.params.id_jabatan);
        if (update) {
            return res.status(200).json({
                status: 1,
                message: "Berhasil",
            })
        } else {
            return res.status(422).json({
                status: 0,
                message: "Gagal, data tidak ditemukan",
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

router.get('/:id_jabatan', async (req, res) => {
    try {
        const result = await database("tb_jabatan").select("*").where('id_jabatan', req.params.id_jabatan).first();
        if (result) {
            return res.status(200).json({
                status: 1,
                message: "berhasil",
                result: result
            })
        } else {
            return res.status(404).json({
                status: 0,
                message: "data tidak ditemukan",
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});


module.exports = router;