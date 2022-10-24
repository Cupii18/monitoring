const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");

router.get('/', async (req, res) => {
    try {
        const result = await database
            .select("*")
            .from('tb_jenis_device')
            .where('status', 'a')
            .modify(function (queryBuilder) {
                if (req.query.cari) {
                    queryBuilder.where('nama_jenis', 'like', '%' + req.query.cari + '%')
                }
            })
            .paginate({
                perPage: req.query.limit || null,
                currentPage: req.query.page || null,
                isLengthAware: true
            });


        if (result.data.length > 0) {
            return res.status(200).json({
                status: 1,
                message: "Berhasil",
                result: result.data,
                per_page: result.pagination.perPage,
                total_pages: req.query.limit ? result.pagination.to : null,
                total_data: req.query.limit ? result.pagination.total : null
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
        const simpan = await database("tb_jenis_device").insert(input);
        if (simpan) {
            return res.status(200).json({
                status: 1,
                message: "Berhasil",
                result: {
                    id_jenis_device: simpan[0],
                    ...input
                }
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

router.put('/:id_jenis_device', validasi_data.edit_data, verifikasi_validasi_data, async (req, res) => {
    const data = req.body;
    try {
        const result = await database("tb_jenis_device").where('id_jenis_device', req.params.id_jenis_device).first();
        if (result) {
            await database("tb_jenis_device").update(data).where('id_jenis_device', req.params.id_jenis_device);
            return res.status(200).json({
                status: 1,
                message: "Berhasil"
            })
        } else {
            return res.status(400).json({
                status: 0,
                message: "Data tidak ditemukan",
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        });
    }
});

router.delete('/:id_jenis_device', async (req, res) => {
    try {
        const update = await database("tb_jenis_device").update("status", "t").where('id_jenis_device', req.params.id_jenis_device);
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

router.get('/:id_jenis_device', async (req, res) => {
    try {
        const result = await database("tb_jenis_device").select("*").where('id_jenis_device', req.params.id_jenis_device).first();
        if (result) {
            return res.status(200).json({
                status: 1,
                message: "berhasil",
                result: result
            })
        } else {
            return res.status(400).json({
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