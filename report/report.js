const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");
const PDFDocument = require('./pdfkit-tables.js');
const nodemailer = require('nodemailer');
const moment = require("moment/moment");


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

router.post('/export/pdf', async (req, res) => {
    try {
        const result = await database
            .select(
                'monitor_dc.id_monitor_dc',
                'monitor_dc.waktu',
                'tb_device.nama_device',
                'tb_device.id_device',
                'tb_jenis_device.nama_jenis',
                'tb_jenis_device.id_jenis_device',
                'monitor_dc.waktu',
                'monitor_dc.tegangan',
                'monitor_dc.kwh',
                'monitor_dc.watt',
                'monitor_dc.arus',
                'tb_indikator.nama_indikator',
                'tb_indikator.id_indikator',
                'tb_indikator.satuan',
                'tb_indikator.icon',
                'tb_indikator.satuan',
                'tb_indikator.minimum',
                'tb_indikator.maksimum',
            )
            .from('monitor_dc')
            .join('tb_device', 'monitor_dc.id_device', 'tb_device.id_device')
            .join('tb_jenis_device', 'tb_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
            .join('tb_indikator', 'tb_device.id_device', 'tb_indikator.id_device')
            .join('tb_sektor', 'tb_device.id_sektor', 'tb_sektor.id_sektor')
            .orderBy('monitor_dc.id_monitor_dc', 'desc')
            .where('monitor_dc.waktu', '>=', req.body.periode)
            .where('tb_device.id_device', req.body.id_device)
            .where('tb_indikator.id_indikator', req.body.id_indikator)

        const monitor = [];

        for (let i = 0; i < result.length; i++) {
            const waktu = moment.utc(result[i].waktu, 'YYYY-MM-DDTHH:mm:ss.SSS').format('YYYY-MM-DD HH:mm:ss')
            const now = moment().format('YYYY-MM-DD HH:mm:ss')
            const checkBatas = await database
                .select(
                    'tb_threshold.id_threshold',
                    'tb_threshold.id_indikator',
                    'tb_threshold.minimum',
                    'tb_threshold.maksimum',
                )
                .from('tb_threshold')
                .join('tb_indikator', 'tb_threshold.id_indikator', 'tb_indikator.id_indikator')
                .join('tb_device', 'tb_indikator.id_device', 'tb_device.id_device')
                .join('tb_jenis_device', 'tb_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
                .where('tb_threshold.id_indikator', result[i].id_indikator)
                .andWhere('tb_jenis_device.id_jenis_device', result[i].id_jenis_device)
                .andWhere('tb_device.id_device', result[i].id_device)
                .first()

            if (checkBatas) {
                if (result[i].satuan == 'A') {
                    if (result[i].arus < checkBatas.minimum || result[i].arus > checkBatas.maksimum) {
                        if (result[i].arus <= result[i].minimum || result[i].arus >= result[i].maksimum) {
                            monitor.push({
                                id_monitor_dc: result[i].id_monitor_dc,
                                waktu: result[i].waktu,
                                nama_device: result[i].nama_device,
                                nama_jenis: result[i].nama_jenis,
                                nama_indikator: result[i].nama_indikator,
                                satuan: result[i].satuan,
                                icon: result[i].icon,
                                arus: result[i].arus,
                                minimum: result[i].minimum,
                                maksimum: result[i].maksimum,
                                status: 'danger'
                            })
                        } else {
                            result[i].status = 'warning'
                        }
                    } else {
                        result[i].status = 'success'
                    }
                } else if (result[i].satuan == 'W') {
                    if (result[i].watt < checkBatas.minimum || result[i].watt > checkBatas.maksimum) {
                        if (result[i].watt <= result[i].minimum || result[i].watt >= result[i].maksimum) {
                            monitor.push({
                                id_monitor_dc: result[i].id_monitor_dc,
                                waktu: result[i].waktu,
                                nama_device: result[i].nama_device,
                                nama_jenis: result[i].nama_jenis,
                                nama_indikator: result[i].nama_indikator,
                                satuan: result[i].satuan,
                                icon: result[i].icon,
                                arus: result[i].arus,
                                minimum: result[i].minimum,
                                maksimum: result[i].maksimum,
                                status: 'danger'
                            })
                        } else {
                            result[i].status = 'warning'
                        }
                    } else {
                        result[i].status = 'success'
                    }
                } else if (result[i].satuan == 'Wh') {
                    if (result[i].kwh < checkBatas.minimum || result[i].kwh > checkBatas.maksimum) {
                        if (result[i].kwh <= result[i].minimum || result[i].kwh >= result[i].maksimum) {
                            monitor.push({
                                id_monitor_dc: result[i].id_monitor_dc,
                                waktu: result[i].waktu,
                                nama_device: result[i].nama_device,
                                nama_jenis: result[i].nama_jenis,
                                nama_indikator: result[i].nama_indikator,
                                satuan: result[i].satuan,
                                icon: result[i].icon,
                                arus: result[i].arus,
                                minimum: result[i].minimum,
                                maksimum: result[i].maksimum,
                                status: 'danger'
                            })
                        } else {
                            result[i].status = 'warning'
                        }
                    } else {
                        result[i].status = 'success'
                    }
                } else if (result[i].satuan == 'V') {
                    if (result[i].tegangan < checkBatas.minimum || result[i].tegangan > checkBatas.maksimum) {
                        if (result[i].tegangan <= result[i].minimum || result[i].tegangan >= result[i].maksimum) {
                            monitor.push({
                                id_monitor_dc: result[i].id_monitor_dc,
                                waktu: result[i].waktu,
                                nama_device: result[i].nama_device,
                                nama_jenis: result[i].nama_jenis,
                                nama_indikator: result[i].nama_indikator,
                                satuan: result[i].satuan,
                                icon: result[i].icon,
                                arus: result[i].arus,
                                minimum: result[i].minimum,
                                maksimum: result[i].maksimum,
                                status: 'danger'
                            })
                        } else {
                            result[i].status = 'warning'
                        }
                    } else {
                        result[i].status = 'success'
                    }
                }
            }
        }

        const report = monitor.map((item) => {
            return {
                waktu: moment.utc(item.waktu).format('D MMM YYYY HH:mm:ss'),
                nama_device: item.nama_device,
                nama_jenis: item.nama_jenis,
                nama_indikator: item.nama_indikator,
                arus: item.arus + ' ' + item.satuan,
                status: item.status == 'danger' ? 'Danger' : 'Warning'
            }
        })
        const doc = new PDFDocument();

        doc
            .fillColor("#444444")
            .fontSize(20)
            .text(req.body.nama_report, 110, 57, { align: "center" })
            .fontSize(10)
            .moveDown();

        const table = {
            headers: ["Waktu", "Device", "Jenis Device", "Indikator", "Arus", "Status"],
            rows: []
        };

        for (const monitor of report) {
            table.rows.push([
                monitor.waktu,
                monitor.nama_device,
                monitor.nama_jenis,
                monitor.nama_indikator,
                monitor.arus,
                monitor.status
            ])
        }

        // Draw the table
        doc.moveDown().table(table, 10, 125, { width: 590 });

        // Finalize the PDF and end the stream
        doc.end();

        var transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: 'monitoringelectrical@gmail.com',
                pass: 'jutoefwhvbcolwtp'
            }
        });

        const user = await database('tb_petugas').where('id_petugas', req.body.id_petugas).first()

        // send mail with file
        var mailOptions = {
            from: 'monitoringelectrical@gmail.com',
            to: user.email,
            subject: 'Report',
            text: 'Report',
            attachments: [{
                filename: 'report.pdf',
                content: doc
            }]
        };

        transporter.sendMail(mailOptions, async (err, info) => {
            if (err) {
                res.status(400).json({
                    message: 'Email gagal dikirim',
                    error: err
                })
            } else {
                const data = {
                    id_indikator: req.body.id_indikator,
                    id_petugas: req.body.id_petugas,
                    nama_report: req.body.nama_report,
                    periode: req.body.periode,
                    status: 'a',
                    created_at: moment().format('YYYY-MM-DDTHH:mm:ss'),
                    updated_at: moment().format('YYYY-MM-DDTHH:mm:ss')
                }
                if (req.body.id_report) {
                    await database('tb_report').where('id_report', req.body.id_report).update(data)
                } else {
                    await database('tb_report').insert(data)
                }

                return res.status(200).json({
                    status: 'success',
                    message: 'Email berhasil dikirim',
                })
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