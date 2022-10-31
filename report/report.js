const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");


router.get('/', async (req, res) => {
    try {
        const result = await database
            .select(
                "report.id_report",
                "report.nama_report",
                "report.periode",
                "report.interval",
                "report.waktu",
                "indikator.nama_indikator",
                "device.nama_device",
                "petugas.nama_lengkap"
            )
            .from("tb_report as report")
            .leftJoin('tb_indikator as indikator', 'report.id_indikator', 'indikator.id_indikator')
            .leftJoin("tb_device as device", "report.id_device", "indikator.id_device")
            .leftJoin("tb_petugas as petugas", "report.id_petugas", "petugas.id_petugas")
            .where('report.status', 'a')
            .groupBy('indikator.id_indikator')
            .modify(function (queryBuilder) {
                if (req.query.cari) {
                    queryBuilder.where('report.nama_report', 'like', '%' + req.query.cari + '%')
                        .orWhere('report.nama_device', 'like', '%' + req.query.cari + '%')
                        .orWhere('report.nama_indikator', 'like', '%' + req.query.cari + '%')
                        .orWhere('report.nama_lengkap', 'like', '%' + req.query.cari + '%')
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
        const simpan = await database("tb_report").insert(input);
        if (simpan) {
            return res.status(201).json({
                status: 1,
                message: "Berhasil",
                result: {
                    id_report: simpan[0],
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

router.put('/:id_report', validasi_data.edit_data, verifikasi_validasi_data, async (req, res) => {
    const data = req.body;
    data.updated_at = new Date();
    try {
        const result = await database("tb_report").where('id_report', req.params.id_report).first();
        if (result) {
            await database("tb_report").update(data).where('id_report', req.params.id_report);
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

router.delete('/:id_report', async (req, res) => {
    const data = {
        status: "t",
        updated_at: new Date()
    }
    try {
        const update = await database("tb_report").update(data).where('id_report', req.params.id_report);
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

router.get('/:id_report', async (req, res) => {
    try {
        const result = await database
        .select(
            "report.id_report",
            "report.nama_report",
            "report.periode",
            "report.interval",
            "report.waktu",
            "indikator.nama_indikator",
            "device.nama_device",
            "petugas.nama_lengkap"
            )
        .from("tb_report as report")
        .leftJoin('tb_indikator as indikator', 'report.id_indikator', 'indikator.id_indikator')
        .leftJoin("tb_device as device", "report.id_device", "indikator.id_device")
        .leftJoin("tb_petugas as petugas", "report.id_petugas", "petugas.id_petugas")
        .where('report.status', 'a')
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