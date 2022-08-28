const {check} = require("express-validator");

module.exports.data = [
    check('id_card').not().isEmpty().withMessage('id_card harus ada data'),
    check('nama').not().isEmpty().withMessage('nama harus ada data'),
    check('jabatan').not().isEmpty().withMessage('jabatan harus ada data'),
    check('email').not().isEmpty().withMessage('email harus ada data'),
    check('status').not().not().isEmpty().withMessage('status harus ada data')
    
]

module.exports.edit_data = [
    check('id_card').not().isEmpty().withMessage('id_card harus ada data'),
    check('nama').not().isEmpty().withMessage('nama harus ada data'),
    check('jabatan').not().isEmpty().withMessage('jabatan harus ada data'),
    check('email').not().isEmpty().withMessage('email harus ada data'),
    check('status').not().not().isEmpty().withMessage('status harus ada data')
]