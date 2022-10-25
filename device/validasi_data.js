const { check } = require("express-validator");

module.exports.data = [
    check('id_jenis_device').not().isEmpty().withMessage('Jenis Device tidak boleh kosong'),
    check('id_sektor').not().isEmpty().withMessage('Sektor tidak boleh kosong'),
    check('id_indikator').not().isEmpty().withMessage('Indikator tidak boleh kosong'),
    check('nama_device').not().isEmpty().withMessage('Nama Device tidak boleh kosong'),

]

module.exports.edit_data = [
    check('id_jenis_device').not().isEmpty().withMessage('Jenis Device tidak boleh kosong'),
    check('id_sektor').not().isEmpty().withMessage('Sektor tidak boleh kosong'),
    check('id_indikator').not().isEmpty().withMessage('Indikator tidak boleh kosong'),
    check('nama_device').not().isEmpty().withMessage('Nama Device tidak boleh kosong'),
]