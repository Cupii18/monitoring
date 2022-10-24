const { check } = require("express-validator");

module.exports.data = [
    check('nama_sektor').not().isEmpty().withMessage('Nama Sektor tidak boleh kosong'),
    check('deskripsi').not().isEmpty().withMessage('Deskripsi tidak boleh kosong'),
    check('alamat').not().isEmpty().withMessage('Alamat tidak boleh kosong'),
]

module.exports.edit_data = [
    check('nama_sektor').not().isEmpty().withMessage('Nama Sektor tidak boleh kosong'),
    check('deskripsi').not().isEmpty().withMessage('Deskripsi tidak boleh kosong'),
    check('alamat').not().isEmpty().withMessage('Alamat tidak boleh kosong'),
]