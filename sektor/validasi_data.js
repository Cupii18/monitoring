const {check} = require("express-validator");

module.exports.data = [
    check('nama_sektor').not().isEmpty().withMessage('nama_jabatan harus ada data'),
    check('deskripsi').not().isEmpty().withMessage('deskripsi harus ada data'),
    check('alamat').not().isEmpty().withMessage('alamat harus ada data'),
    check('status').not().isEmpty().withMessage('status harus ada data')
]

module.exports.edit_data = [
    check('nama_sektor').not().isEmpty().withMessage('nama_sektor harus ada data'),
    check('deskripsi').not().isEmpty().withMessage('deskripsi harus ada data'),
    check('alamat').not().isEmpty().withMessage('alamat harus ada data'),
    check('status').not().isEmpty().withMessage('status harus ada data')
]