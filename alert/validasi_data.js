const { check } = require("express-validator");

module.exports.data = [
    check('id_petugas').not().isEmpty().withMessage('Petugas tidak boleh kosong'),
    check('id_device').not().isEmpty().withMessage('Device tidak boleh kosong'),
    check('nama_alert').not().isEmpty().withMessage('Nama Alert tidak boleh kosong'),
    check('kondisi').not().not().isEmpty().withMessage('Kondisi tidak boleh kosong'),
    check('interval').not().not().isEmpty().withMessage('Interval tidak boleh kosong'),
    check('tanggal').not().not().isEmpty().withMessage('Tanggal tidak boleh kosong'),

]

module.exports.edit_data = [
    check('id_petugas').not().isEmpty().withMessage('id_petugas harus ada data'),
    check('id_device').not().isEmpty().withMessage('id_device harus ada data'),
    check('nama_alert').not().isEmpty().withMessage('nama_alert harus ada data'),
    check('kondisi').not().not().isEmpty().withMessage('kondisi  harus ada data'),
    check('interval').not().not().isEmpty().withMessage('interval harus ada data'),
    check('tanggal').not().not().isEmpty().withMessage('tangggal harus ada data')
]