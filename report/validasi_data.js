const { check } = require("express-validator");

module.exports.data = [
    check('id_device').not().isEmpty().withMessage('id_device tidak boleh kosong'),
    check('id_indikator').not().isEmpty().withMessage('id_indikator tidak boleh kosong'),
    check('nama_report').not().isEmpty().withMessage('nama_report tidak boleh kosong'),
    check('periode').not().not().isEmpty().withMessage('periode tidak boleh kosong'),
    check('interval').not().not().isEmpty().withMessage('interval tidak boleh kosong'),
    check('waktu').not().not().isEmpty().withMessage('waktu tidak boleh kosong'),
    check('email').not().isEmpty().withMessage('email tidak boleh kosong'),
]

module.exports.edit_data = [
    check('id_device').not().isEmpty().withMessage('id_device tidak boleh kosong'),
    check('id_indikator').not().isEmpty().withMessage('id_indikator tidak boleh kosong'),
    check('nama_report').not().isEmpty().withMessage('nama_report tidak boleh kosong'),
    check('periode').not().not().isEmpty().withMessage('periode tidak boleh kosong'),
    check('interval').not().not().isEmpty().withMessage('interval tidak boleh kosong'),
    check('waktu').not().not().isEmpty().withMessage('waktu tidak boleh kosong'),
    check('email').not().isEmpty().withMessage('email tidak boleh kosong'),
]