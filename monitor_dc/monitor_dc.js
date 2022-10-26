const express = require("express");
const router = express.Router();
const database = require("../config/database");

router.get('/', async (req, res) => {
    try {
        const result = await database
            .select('tb_device.nama_device', 'monitor_dc.waktu', 'monitor_dc.tegangan', 'monitor_dc.arus', 'monitor_dc.whatt', 'monitor_dc.kwh', 'tb_indikator.nama_indikator', 'tb_indikator.satuan')
            .from('monitor_dc')
            .join('tb_device', 'monitor_dc.id_device', 'tb_device.id_device')
            .join('tb_indikator', 'tb_device.id_device', 'tb_indikator.id_device')
            .join('tb_sektor', 'tb_device.id_sektor', 'tb_sektor.id_sektor')
            .modify(function (queryBuilder) {
                if (req.query.id_sektor) {
                    queryBuilder.where('tb_sektor.id_sektor', req.query.id_sektor)
                }

                if (req.query.id_device) {
                    queryBuilder.where('tb_device.id_device', req.query.id_device)
                }

                if (req.query.id_indikator) {
                    queryBuilder.where('tb_indikator.id_indikator', req.query.id_indikator)
                }
            })

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
        // Split string
        const sensor = req.query.sensor.split(", ");
        const checkDevice = await database("tb_device")
            .join("tb_jenis_device", "tb_device.id_jenis_device", "tb_jenis_device.id_jenis_device")
            .join("tb_sektor", "tb_device.id_sektor", "tb_sektor.id_sektor")
            .where("tb_device.nama_device", sensor[0])
            .where("tb_jenis_device.nama_jenis", sensor[1])
            .where("tb_sektor.nama_sektor", req.query.lokasi)
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
            tegangan: parseFloat(req.query.tegangan),
            arus: parseFloat(req.query.arus),
            watt: parseFloat(req.query.watt),
            kwh: parseFloat(req.query.kwh),
            status: req.query.status,
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
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});



module.exports = router;