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
            .groupBy('jenis_device.id_jenis_device')
            .modify(function (queryBuilder) {
                if (req.query.cari) {
                    queryBuilder.where('device.nama_device', 'like', '%' + req.query.cari + '%')
                        .orWhere('jenis_device.nama_jenis', 'like', '%' + req.query.cari + '%')
                        .orWhere('sektor.nama_sektor', 'like', '%' + req.query.cari + '%')
                        .orWhere('indikator.nama_indikator', 'like', '%' + req.query.cari + '%')
                }

                if (req.query.sektor) {
                    if (req.query.sektor != 'all') {
                        queryBuilder.where('device.id_sektor', req.query.sektor)
                    }
                }
            })
            .paginate({
                perPage: parseInt(req.query.limit) || 5000,
                currentPage: req.query.page || null,
                isLengthAware: true
            });

        for (let i = 0; i < result.data.length; i++) {
            const indikator = await database
                .select(
                    "indikator.id_indikator",
                    "indikator.nama_indikator",
                    "indikator.satuan",
                    "indikator.minimum",
                    "indikator.maksimum",
                    "indikator.status",
                    "indikator.icon",
                )
                .from('tb_device as device')
                .leftJoin('tb_indikator as indikator', 'device.id_indikator', 'indikator.id_indikator')
                .where('device.nama_device', result.data[i].nama_device)
                .where('indikator.status', 'a')

            result.data[i].nama_indikator = indikator.map((item) => {
                return item.nama_indikator
            })

            result.data[i].indikator = indikator

            result.data[i].nama_indikator = result.data[i].nama_indikator.join(', ')
        }


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

        const cek = await database("tb_device").where("id_device", req.params.id_device).first();

        if (cek) {
            await database("tb_device").where("nama_device", cek.nama_device).del();
            for (let i = 0; i < data.id_indikator.length; i++) {
                const update = {
                    nama_device: data.nama_device,
                    id_jenis_device: data.id_jenis_device,
                    id_sektor: data.id_sektor,
                    id_indikator: data.id_indikator[i],
                    deskripsi: data.deskripsi,
                    status: "a",
                    updated_at: data.updated_at
                }
                await database("tb_device").insert(update);
            }
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
        const result = await database
            .select(
                "device.id_device",
                "device.nama_device",
                "device.deskripsi",
                "device.status",
                "jenis_device.nama_jenis",
                "sektor.nama_sektor",
                "jenis_device.id_jenis_device",
                "sektor.id_sektor",
            )
            .from('tb_device as device')
            .leftJoin('tb_jenis_device as jenis_device', 'device.id_jenis_device', 'jenis_device.id_jenis_device')
            .leftJoin('tb_sektor as sektor', 'device.id_sektor', 'sektor.id_sektor')
            .where('device.status', 'a')
            .where('device.id_device', req.params.id_device)
            .first();

        if (result) {
            const indikator = await database
                .select(
                    "indikator.id_indikator",
                )
                .from('tb_device as device')
                .leftJoin('tb_indikator as indikator', 'device.id_indikator', 'indikator.id_indikator')
                .where('device.nama_device', result.nama_device)
                .where('indikator.status', 'a')

            result.id_indikator = indikator.map((item) => {
                return item.id_indikator
            })
        }

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

router.get('/list/filter', async (req, res) => {
    try {
        const result = await database
            .select(
                'nama_sektor as text',
                'id_sektor as value'
            )
            .from('tb_sektor')
            .where('status', 'a')
            .orderBy('nama_sektor', 'asc');

        return res.status(200).json({
            sektor: result
        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
});

module.exports = router;