const {check} = require("express-validator");

module.exports.data = [
    check('id_jenis_device').not().isEmpty().withMessage('id_jenis_device harus ada data'),
    check('id_sektor').not().isEmpty().withMessage('id_sektor harus ada data'),
    check('nama_device').not().isEmpty().withMessage('nama_device harus ada data'),
    check('deskripsi').not().not().isEmpty().withMessage('deskripsi harus ada data'),
    check('status').not().not().isEmpty().withMessage('status harus ada data')
]

module.exports.edit_data = [
    check('id_jenis_device').not().isEmpty().withMessage('id_jenis_device harus ada data'),
    check('id_sektor').not().isEmpty().withMessage('id_sektor harus ada data'),
    check('nama_device').not().isEmpty().withMessage('nama_device harus ada data'),
    check('deskripsi').not().not().isEmpty().withMessage('deskripsi harus ada data'),
    check('status').not().not().isEmpty().withMessage('status harus ada data')
]