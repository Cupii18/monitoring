const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");

router.get('/', async (req, res) => {
    try {
        const result = await database
            .select(
                "device.id_device",
                "device.nama_device",
                "device.deskripsi",
                "device.status",
                "jenis_device.nama_jenis",
                "sektor.nama_sektor",
            )
            .from('tb_device as device')
            .leftJoin('tb_jenis_device as jenis_device', 'device.id_jenis_device', 'jenis_device.id_jenis_device')
            .leftJoin('tb_sektor as sektor', 'device.id_sektor', 'sektor.id_sektor')
            .where('device.status', 'a')
            .modify(function (queryBuilder) {
                if (req.query.cari) {
                    queryBuilder.where('device.nama_device', 'like', '%' + req.query.cari + '%')
                        .orWhere('jenis_device.nama_jenis', 'like', '%' + req.query.cari + '%')
                        .orWhere('sektor.nama_sektor', 'like', '%' + req.query.cari + '%')
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
        updated_at: new Date()
    }
    try {
        const simpan = await database("tb_device").insert(input);
        if (simpan) {
            return res.status(201).json({
                status: 1,
                message: "Berhasil",
                result: {
                    id_device: simpan[0],
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

router.put('/:id_device', validasi_data.edit_data, verifikasi_validasi_data, async (req, res) => {
    const data = req.body;
    data.updated_at = new Date();
    try {
        const result = await database("tb_device").where('id_device', req.params.id_device).first();
        if (result) {
            await database("tb_device").update(data).where('id_device', req.params.id_device);
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

router.delete('/:id_device', async (req, res) => {
    try {
        const data = {
            status: "t",
            updated_at: new Date()
        }
        const update = await database("tb_device").update(data).where('id_device', req.params.id_device);
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

router.get('/:id_device', async (req, res) => {
    try {
        const result = await database("tb_device").select("*").where('id_device', req.params.id_device).first();
        if (result) {
            return res.status(200).json({
                status: 1,
                message: "Berhasil",
                result: result
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
        })
    }
});


module.exports = router;