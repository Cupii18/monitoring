const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");
const fs = require('fs');
const puppeteer = require('puppeteer');
const mustache = require('mustache');
const path = require("path");


router.get('/', async (req, res) => {
    try {
        const result = await database
            .select(
                "report.id_report",
                "report.nama_report",
                "report.periode",
                "indikator.nama_indikator",
                "device.nama_device",
                "petugas.email"
            )
            .from("tb_report as report")
            .leftJoin('tb_indikator as indikator', 'report.id_indikator', 'indikator.id_indikator')
            .leftJoin('tb_device as device', 'indikator.id_device', 'device.id_device')
            .leftJoin("tb_petugas as petugas", "report.id_petugas", "petugas.id_petugas")
            .where('report.status', 'a')
            .modify(function (queryBuilder) {
                if (req.query.cari) {
                    queryBuilder.where('report.nama_report', 'like', '%' + req.query.cari + '%')
                        .orWhere('report.nama_device', 'like', '%' + req.query.cari + '%')
                        .orWhere('report.nama_indikator', 'like', '%' + req.query.cari + '%')
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
                "indikator.id_indikator",
                "indikator.nama_indikator",
                "device.id_device",
                "device.nama_device",
                "petugas.id_petugas",
                "petugas.email"
            )
            .from("tb_report as report")
            .leftJoin('tb_indikator as indikator', 'report.id_indikator', 'indikator.id_indikator')
            .leftJoin('tb_device as device', 'indikator.id_device', 'device.id_device')
            .leftJoin("tb_petugas as petugas", "report.id_petugas", "petugas.id_petugas")
            .where('report.status', 'a')
            .where('report.id_report', req.params.id_report)
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

// export pdf
router.get('/export/pdf', async (req, res) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const htmlBody = fs.readFileSync(path.join(__dirname, 'main.html'), 'utf8');
        const data = {
            title: "Report",
            data: [
                {
                    id_report: 1,
                    nama_report: "Report 1",
                    periode: "2020-01-01",
                    interval: "1",
                    waktu: "2020-01-01 00:00:00",
                    nama_indikator: "Indikator 1",
                    nama_device: "Device 1",
                    nama_lengkap: "Petugas 1"
                },
                {
                    id_report: 2,
                    nama_report: "Report 2",
                    periode: "2020-01-01",
                    interval: "1",
                    waktu: "2020-01-01 00:00:00",
                    nama_indikator: "Indikator 2",
                    nama_device: "Device 2",
                    nama_lengkap: "Petugas 2"
                },
            ]
        };

        await page.setContent(mustache.render(htmlBody, data));
        const pdf = await page.pdf({ format: 'A4' });
        fs.writeFileSync("./report.pdf", pdf);
        browser.close();

        res.contentType("application/pdf");
        return res.send(pdf);
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

module.exports = router;