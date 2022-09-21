const {check} = require("express-validator");

module.exports.data = [
    check('id_device').not().isEmpty().withMessage('id_device harus ada data'),
    check('nama_indikator').not().isEmpty().withMessage('nama_indikator harus ada data'),
    check('satuan').not().isEmpty().withMessage('satuan harus ada data'),
    check('minimum').not().not().isEmpty().withMessage('minimum harus ada data'),
    check('maksimum').not().not().isEmpty().withMessage('maksimum harus ada data'),
    check('status').not().not().isEmpty().withMessage('status harus ada data')
]

module.exports.edit_data = [
    check('id_device').not().isEmpty().withMessage('id_device harus ada data'),
    check('nama_indikator').not().isEmpty().withMessage('nama_indikator harus ada data'),
    check('satuan').not().isEmpty().withMessage('satuan harus ada data'),
    check('minimum').not().not().isEmpty().withMessage('minimum harus ada data'),
    check('maksimum').not().not().isEmpty().withMessage('maksimum harus ada data'),
    check('status').not().not().isEmpty().withMessage('status harus ada data')
]