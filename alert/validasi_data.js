const { check } = require("express-validator");

module.exports.data = [
    check('id_petugas').not().isEmpty().withMessage('Petugas tidak boleh kosong'),
    check('id_device').not().isEmpty().withMessage('Device tidak boleh kosong'),
    check('nama_alert').not().isEmpty().withMessage('Nama Alert tidak boleh kosong'),
    check('kondisi').not().not().isEmpty().withMessage('Kondisi tidak boleh kosong'),
    check('interval').not().not().isEmpty().withMessage('Interval tidak boleh kosong'),
]

module.exports.edit_data = [
    check('id_petugas').not().isEmpty().withMessage('Petugas tidak boleh kosong'),
    check('id_device').not().isEmpty().withMessage('Device tidak boleh kosong'),
    check('nama_alert').not().isEmpty().withMessage('Nama Alert tidak boleh kosong'),
    check('kondisi').not().not().isEmpty().withMessage('Kondisi tidak boleh kosong'),
    check('interval').not().not().isEmpty().withMessage('Interval tidak boleh kosong'),
]