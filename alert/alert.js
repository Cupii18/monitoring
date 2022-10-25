const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");


router.get('/', async (req, res) => {
    try {
        const result = await database
            .select(
                "alert.id_alert",
                "alert.nama_alert",
                "alert.kondisi",
                "alert.interval",
                "alert.status",
                "alert.tanggal",
                "device.nama_device",
                "jenis_device.nama_jenis",
                "petugas.nama_lengkap",
                "jabatan.nama_jabatan",
            )
            .from('tb_alert as alert')
            .leftJoin('tb_device as device', 'alert.id_device', 'device.id_device')
            .leftJoin('tb_jenis_device as jenis_device', 'device.id_jenis_device', 'jenis_device.id_jenis_device')
            .leftJoin('tb_petugas as petugas', 'alert.id_petugas', 'petugas.id_petugas')
            .leftJoin('tb_jabatan as jabatan', 'petugas.id_jabatan', 'jabatan.id_jabatan')
            .where('alert.status', 'a')
            .modify(function (queryBuilder) {
                if (req.query.cari) {
                    queryBuilder.where('alert.nama_alert', 'like', '%' + req.query.cari + '%')
                        .orWhere('device.nama_device', 'like', '%' + req.query.cari + '%')
                        .orWhere('jenis_device.nama_jenis', 'like', '%' + req.query.cari + '%')
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
        status: "a"
    }
    try {
        const simpan = await database("tb_alert").insert(input);
        if (simpan) {
            return res.status(201).json({
                status: 1,
                message: "Berhasil",
                result: {
                    id_alert: simpan[0],
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

router.put('/:id_alert', validasi_data.edit_data, verifikasi_validasi_data, async (req, res) => {
    const data = req.body;
    try {
        const result = await database("tb_alert").where('id_alert', req.params.id_alert).first();
        if (result) {
            await database("tb_alert").update(data).where('id_alert', req.params.id_alert);
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

router.delete('/:id_alert', async (req, res) => {
    try {
        const update = await database("tb_alert").update("status", "t").where('id_alert', req.params.id_alert);
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

router.get('/:id_alert', async (req, res) => {
    try {
        const result = await database("tb_alert").select("*").where('id_alert', req.params.id_alert).andWhere('status', 'a').first();
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