const { check } = require("express-validator");

module.exports.data = [
    check('nama_jabatan').not().isEmpty().withMessage('Nama Jabatan tidak boleh kosong'),

]

module.exports.edit_data = [
    check('nama_jabatan').not().isEmpty().withMessage('Nama Jabatan tidak boleh kosong'),
]