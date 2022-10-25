const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");

router.get('/', async (req, res) => {
    try {
        const result = await database
            .select("*")
            .from('tb_sektor')
            .where('status', 'a')
            .modify(function (queryBuilder) {
                if (req.query.cari) {
                    queryBuilder.where('nama_sektor', 'like', `%${req.query.cari}%`)
                        .orWhere('deskripsi', 'like', `%${req.query.cari}%`)
                        .orWhere('alamat', 'like', `%${req.query.cari}%`)
                }
            }).paginate({
                perPage: parseInt(req.query.limit) || 5000,
                currentPage: req.query.page || null,
                isLengthAware: true,
            });

        return res.status(200).json({
            status: 1,
            message: "berhasil",
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

router.post('/', validasi_data.data, verifikasi_validasi_data, async (req, res) => {
    const data = req.body;
    const input = {
        ...data,
        status: "a"
    }
    try {
        const simpan = await database("tb_sektor").insert(input);
        if (simpan) {
            return res.status(201).json({
                status: 1,
                message: "Berhasil",
                result: {
                    id_sektor: simpan[0],
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

router.put('/:id_sektor', validasi_data.edit_data, verifikasi_validasi_data, async (req, res) => {
    const data = req.body;
    try {
        const result = await database("tb_sektor")
            .where('id_sektor', req.params.id_sektor)
            .first();

        if (result) {
            await database("tb_sektor").update(data).where('id_sektor', req.params.id_sektor);
            return res.status(201).json({
                status: 1,
                message: "Berhasil"
            })
        } else {
            return res.status(422).json({
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

router.delete('/:id_sektor', async (req, res) => {
    try {
        const update = await database("tb_sektor").update("status", "t").where('id_sektor', req.params.id_sektor);
        if (update) {
            return res.status(201).json({
                status: 1,
                message: "Berhasil",
            })
        } else {
            return res.status(422).json({
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

router.get('/:id_sektor', async (req, res) => {
    try {
        const result = await database("tb_sektor")
            .select("*")
            .where('id_sektor', req.params.id_sektor)
            .andWhere('status', 'a')
            .first();

        return res.status(200).json({
            status: 1,
            message: "Berhasil",
            result: result || {}
        })

    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});


module.exports = router;