const express = require("express");
const router = express.Router();
const database = require("../config/database");

router.get('/', async (req, res) => {
    try {
        const result = await database
            .select(
                'monitor_dc.id_monitor_dc',
                'tb_device.nama_device',
                'tb_jenis_device.nama_jenis',
                'monitor_dc.waktu',
                'monitor_dc.tegangan',
                'monitor_dc.arus',
                'monitor_dc.watt',
                'monitor_dc.kwh',
                'tb_indikator.nama_indikator',
                'tb_indikator.satuan'
            )
            .from('monitor_dc')
            .join('tb_device', 'monitor_dc.id_device', 'tb_device.id_device')
            .join('tb_jenis_device', 'tb_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
            .join('tb_indikator', 'tb_device.id_device', 'tb_indikator.id_device')
            .join('tb_sektor', 'tb_device.id_sektor', 'tb_sektor.id_sektor')
            .groupBy('monitor_dc.id_device', 'tb_indikator.id_indikator', 'tb_jenis_device.id_jenis_device')

        if (result) {
            return res.status(200).json({
                status: 1,
                message: "Berhasil",
                result: result
            });
        } else {
            return res.status(400).json({
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

// Post
router.post('/', async (req, res) => {
    try {
        // contains ','
        if (req.body.sensor.includes(', ')) {
            const sensor = req.body.sensor.split(", ");

            const checkDevice = await database("tb_device")
                .join("tb_jenis_device", "tb_device.id_jenis_device", "tb_jenis_device.id_jenis_device")
                .join("tb_sektor", "tb_device.id_sektor", "tb_sektor.id_sektor")
                .where("tb_device.nama_device", sensor[0])
                .where("tb_jenis_device.nama_jenis", sensor[1])
                .where("tb_sektor.nama_sektor", req.body.lokasi)
                .select("tb_device.id_device")
                .first();

            if (!checkDevice) {
                return res.status(400).json({
                    status: 0,
                    message: "Device tidak ditemukan"
                });
            }

            const data = {
                id_device: checkDevice.id_device,
                tegangan: parseFloat(req.body.tegangan),
                arus: parseFloat(req.body.arus),
                watt: parseFloat(req.body.watt),
                kwh: parseFloat(req.body.kwh),
                status: req.body.status,
                waktu: new Date(),
                created_at: new Date(),
                updated_at: new Date()
            }

            const insert = await database("monitor_dc").insert(data);
            if (insert) {
                return res.status(201).json({
                    status: 1,
                    message: "Berhasil"
                })
            } else {
                return res.status(422).json({
                    status: 0,
                    message: "Gagal"
                })
            }
        } else {
            return res.status(422).json({
                status: 0,
                message: "Nama dan jenis device tidak dapat ditemukan"
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