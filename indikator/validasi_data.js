const { check } = require("express-validator");

module.exports.data = [
    check("id_device").not().isEmpty().withMessage('Device tidak boleh kosong'),
    check('nama_indikator').not().isEmpty().withMessage('Nama Indikator tidak boleh kosong'),
    check('satuan').not().isEmpty().withMessage('Satuan tidak boleh kosong'),
    check('minimum').not().not().isEmpty().withMessage('Minimum tidak boleh kosong'),
    check('maksimum').not().not().isEmpty().withMessage('Maksimum tidak boleh kosong'),
    check('icon').not().not().isEmpty().withMessage('Icon tidak boleh kosong'),
]

module.exports.edit_data = [
    check('id_device').not().isEmpty().withMessage('Device tidak boleh kosong'),
    check('nama_indikator').not().isEmpty().withMessage('Nama Indikator tidak boleh kosong'),
    check('satuan').not().isEmpty().withMessage('Satuan tidak boleh kosong'),
    check('minimum').not().isEmpty().withMessage('Minimum tidak boleh kosong'),
    check('maksimum').not().isEmpty().withMessage('Maksimum tidak boleh kosong'),
    check('icon').not().isEmpty().withMessage('Icon tidak boleh kosong'),
]