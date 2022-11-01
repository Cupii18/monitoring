const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");

router.get('/', async (req, res) => {
    try {
        const result = await database
            .select(
                "threshold.id_threshold",
                "threshold.minimum",
                "threshold.maksimum",
                "threshold.status",
                "indikator.nama_indikator",
                "device.nama_device",
                "jenis_device.nama_jenis",
            )
            .from("tb_threshold as threshold")
            .leftJoin('tb_indikator as indikator', 'threshold.id_indikator', 'indikator.id_indikator')
            .leftJoin("tb_device as device", "indikator.id_device", "device.id_device")
            .leftJoin("tb_jenis_device as jenis_device", "device.id_jenis_device", "jenis_device.id_jenis_device")
            .where('threshold.status', 'a')
            .modify(function (queryBuilder) {
                if (req.query.cari) {
                    queryBuilder.where('threshold.minimum', 'like', '%' + req.query.cari + '%')
                        .orWhere('threshold.maksimum', 'like', '%' + req.query.cari + '%')
                }
            })
            .paginate({
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
        status: "a",
        created_at: new Date(),
        updated_at: new Date
    }
    try {
        const simpan = await database("tb_threshold").insert(input);
        if (simpan) {
            return res.status(201).json({
                status: 1,
                message: "Berhasil",
                result: {
                    id_threshold: simpan[0],
                    ...input
                }
            })
        } else {
            return res.status(422).json({
                status: 0,
                message: "Gagal simpan",
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

router.put('/:id_threshold', validasi_data.edit_data, verifikasi_validasi_data, async (req, res) => {
    const data = req.body;
    data.updated_at = new Date();
    try {
        const result = await database("tb_threshold").where('id_threshold', req.params.id_threshold).first();
        if (result) {
            await database("tb_threshold").update(data).where('id_threshold', req.params.id_threshold);
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

router.delete('/:id_threshold', async (req, res) => {
    const data = {
        status: "t",
        updated_at: new Date()
    }
    try {
        const update = await database("tb_threshold").update(data).where('id_threshold', req.params.id_threshold);
        if (update) {
            return res.status(201).json({
                status: 1,
                message: "Berhasil",
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

router.get('/:id_threshold', async (req, res) => {
    try {
        const result = await database
            .select(
                "threshold.id_threshold",
                "threshold.minimum",
                "threshold.maksimum",
                "threshold.status",
                "indikator.nama_indikator",
                "device.id_device",
                "indikator.id_indikator",
                "device.nama_device",
            )
            .from("tb_threshold as threshold")
            .leftJoin('tb_indikator as indikator', 'threshold.id_indikator', 'indikator.id_indikator')
            .leftJoin("tb_device as device", "device.id_device", "indikator.id_device")
            .where('threshold.status', 'a')
            .where('threshold.id_threshold', req.params.id_threshold)
            .first();

        return res.status(200).json({
            status: 1,
            message: "Berhasil",
            result: result
        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});


module.exports = router;