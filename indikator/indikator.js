const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");

router.get('/all', async (req, res) => {
    try {
        const result = await database
            .select(
                "indikator.id_indikator",
                "indikator.nama_indikator",
                "indikator.satuan",
                "indikator.minimum",
                "indikator.maksimum",
                "indikator.status",
                "device.nama_device",
                "jenis_device.nama_jenis"
            )
            .from('tb_indikator as indikator')
            .leftJoin('tb_device as device', 'indikator.id_device', 'device.id_device')
            .leftJoin('tb_jenis_device as jenis_device', 'device.id_jenis_device', 'jenis_device.id_jenis_device')
            .where('indikator.status', 'a')
            .modify(function (queryBuilder) {
                if (req.query.cari) {
                    queryBuilder.where('indikator.nama_indikator', 'like', '%' + req.query.cari + '%')
                        .orWhere('device.nama_device', 'like', '%' + req.query.cari + '%')
                        .orWhere('jenis_device.nama_jenis', 'like', '%' + req.query.cari + '%')
                        .orWhere('indikator.satuan', 'like', '%' + req.query.cari + '%')
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
            total_data: req.query.limit ? result.pagination.total : null
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
        const simpan = await database("tb_indikator").insert(input);
        if (simpan) {
            return res.status(201).json({
                status: 1,
                message: "Berhasil",
                result: {
                    id_indikator: simpan[0],
                    ...input
                }
            })
        } else {
            return res.status(422).json({
                status: 0,
                message: "gagal simpan",
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

router.put('/:id_indikator', validasi_data.edit_data, verifikasi_validasi_data, async (req, res) => {
    const data = req.body;
    try {
        const result = await database("tb_indikator").where('id_indikator', req.params.id_indikator).first();
        if (result) {
            await database("tb_indikator").update(data).where('id_indikator', req.params.id_indikator);
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

router.delete('/:id_indikator', async (req, res) => {
    try {
        const update = await database("tb_indikator").update("status", "t").where('id_indikator', req.params.id_indikator);
        if (update) {
            return res.status(201).json({
                status: 1,
                message: "berhasil",
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

router.get('/:id_indikator', async (req, res) => {
    try {
        const result = await database("tb_indikator").select("*").where('id_indikator', req.params.id_indikator).first();
        if (result) {
            return res.status(200).json({
                status: 1,
                message: "berhasil",
                result: result
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