const express = require("express");
const router = express.Router();
const database = require("../config/database");
const validasi_data = require("./validasi_data");
const verifikasi_validasi_data = require("../middleware/verifikasi_validasi_data");
const moment = require("moment");

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
                .leftJoin('tb_indikator as indikator', 'device.id_device', 'indikator.id_device')
                .where('device.id_device', result.data[i].id_device)
                .where('indikator.status', 'a')

            result.data[i].nama_indikator = indikator.map((item) => {
                return item.nama_indikator
            })

            result.data[i].indikator = indikator

            result.data[i].nama_indikator = result.data[i].nama_indikator.join(', ')

            for (let j = 0; j < indikator.length; j++) {
                const element = indikator[j];
                const data = await database
                    .select(
                        'monitor_dc.id_monitor_dc',
                        'monitor_dc.waktu',
                        'device.id_device',
                        'indikator.id_indikator',
                        'jenis_device.id_jenis_device',
                        'monitor_dc.arus',
                        'monitor_dc.tegangan',
                        'monitor_dc.watt',
                        'monitor_dc.kwh',
                        'indikator.satuan',
                    )
                    .from('monitor_dc as monitor_dc')
                    .leftJoin('tb_device as device', 'monitor_dc.id_device', 'device.id_device')
                    .leftJoin('tb_indikator as indikator', 'indikator.id_device', 'device.id_device')
                    .leftJoin('tb_jenis_device as jenis_device', 'device.id_jenis_device', 'jenis_device.id_jenis_device')
                    .where('monitor_dc.id_device', result.data[i].id_device)
                    .join(
                        database.raw(
                            '(select max(id_monitor_dc) as id_monitor_dc from monitor_dc group by id_device) as max_monitor_dc'
                        ),
                        'monitor_dc.id_monitor_dc',
                        'max_monitor_dc.id_monitor_dc'
                    ).first()

                const waktu = moment.utc(data.waktu, 'YYYY-MM-DDTHH:mm:ss.SSS').format('YYYY-MM-DD HH:mm:ss')
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
                    .where('tb_threshold.id_indikator', data.id_indikator)
                    .andWhere('tb_jenis_device.id_jenis_device', data.id_jenis_device)
                    .andWhere('tb_device.id_device', data.id_device)
                    .first()

                if (checkBatas) {
                    if (moment(waktu).format('YYYY-MM-DD') == moment(now).format('YYYY-MM-DD') && moment(waktu).format('HH') == moment(now).format('HH')) {
                        if (data.satuan == 'A') {
                            if (data.arus < checkBatas.minimum || data.arus > checkBatas.maksimum) {
                                if (data.arus <= data.minimum || data.arus >= data.maksimum) {
                                    data.status = 'danger'
                                } else {
                                    data.status = 'warning'
                                }
                            } else {
                                data.status = 'success'
                            }
                        } else if (data.satuan == 'W') {
                            if (data.watt < checkBatas.minimum || data.watt > checkBatas.maksimum) {
                                if (data.watt <= data.minimum || data.watt >= data.maksimum) {
                                    data.status = 'danger'
                                } else {
                                    data.status = 'warning'
                                }
                            } else {
                                data.status = 'success'
                            }
                        } else if (data.satuan == 'Wh') {
                            if (data.kwh < checkBatas.minimum || data.kwh > checkBatas.maksimum) {
                                if (data.kwh <= data.minimum || data.kwh >= data.maksimum) {
                                    data.status = 'danger'
                                } else {
                                    data.status = 'warning'
                                }
                            } else {
                                data.status = 'success'
                            }
                        } else if (data.satuan == 'V') {
                            if (data.tegangan < checkBatas.minimum || data.tegangan > checkBatas.maksimum) {
                                if (data.tegangan <= data.minimum || data.tegangan >= data.maksimum) {
                                    data.status = 'danger'
                                } else {
                                    data.status = 'warning'
                                }
                            } else {
                                data.status = 'success'
                            }
                        }
                    } else {
                        data.status = 'secondary'
                    }
                }

                element.status = data.status
            }
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
                result: simpan
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
                "device.id_jenis_device",
                "device.id_sektor",
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
            .where('device.id_device', req.params.id_device)
            .first();

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
            .leftJoin('tb_indikator as indikator', 'device.id_device', 'indikator.id_device')
            .where('device.id_device', result.id_device)
            .where('indikator.status', 'a')

        result.nama_indikator = indikator.map((item) => {
            return item.nama_indikator
        })

        result.indikator = indikator

        result.nama_indikator = result.nama_indikator.join(', ')


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