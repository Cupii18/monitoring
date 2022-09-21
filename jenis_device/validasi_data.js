const {check} = require("express-validator");

module.exports.data = [
    check('nama_jenis').not().isEmpty().withMessage('nama_jenis harus ada data'),
    check('keterangan').not().isEmpty().withMessage('keterangan harus ada data'),
    check('status').not().isEmpty().withMessage('status harus ada data')
    
]

module.exports.edit_data = [
    check('nama_jenis').not().isEmpty().withMessage('nama_jenis harus ada data'),
    check('keterangan').not().isEmpty().withMessage('keterangan harus ada data'),
    check('status').not().isEmpty().withMessage('status harus ada data')
]