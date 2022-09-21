const {check} = require("express-validator");

module.exports.data = [
    check('nama_jabatan').not().isEmpty().withMessage('nama_jabatan harus ada data'),
    check('status').not().isEmpty().withMessage('status harus ada data')
    
]

module.exports.edit_data = [
    check('nama_jabatan').not().isEmpty().withMessage('nama_jabatan harus ada data'),
    check('status').not().isEmpty().withMessage('status harus ada data')
]