const { check } = require("express-validator");

module.exports.data = [
    check('nama_role').not().isEmpty().withMessage('Nama Role tidak boleh kosong'),

]

module.exports.edit_data = [
    check('nama_role').not().isEmpty().withMessage('Nama Role tidak boleh kosong'),
]