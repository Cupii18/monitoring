const { check } = require("express-validator");

module.exports.data = [
    check('id_device').not().isEmpty().withMessage('Device tidak boleh kosong'),
    check('nama_indikator').not().isEmpty().withMessage('Nama Indikator tidak boleh kosong'),
    check('satuan').not().isEmpty().withMessage('Satuan tidak boleh kosong'),
    check('minimum').not().not().isEmpty().withMessage('minimum harus ada data'),
    check('maksimum').not().not().isEmpty().withMessage('maksimum harus ada data'),
]

module.exports.edit_data = [
    check('id_device').not().isEmpty().withMessage('id_device harus ada data'),
    check('nama_indikator').not().isEmpty().withMessage('nama_indikator harus ada data'),
    check('satuan').not().isEmpty().withMessage('satuan harus ada data'),
    check('minimum').not().not().isEmpty().withMessage('minimum harus ada data'),
    check('maksimum').not().not().isEmpty().withMessage('maksimum harus ada data'),
]