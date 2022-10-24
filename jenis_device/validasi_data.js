const { check } = require("express-validator");

module.exports.data = [
    check('nama_jenis').not().isEmpty().withMessage('Nama Jenis Device tidak boleh kosong'),

]

module.exports.edit_data = [
    check('nama_jenis').not().isEmpty().withMessage('Nama Jenis Device tidak boleh kosong'),
]