const {check} = require("express-validator");

module.exports.data = [
    check('no').not().isEmpty().withMessage('no harus ada data'),
    check('start_time').not().isEmpty().withMessage('start_time harus ada data'),
    check('end_time').not().isEmpty().withMessage('end_time harus ada data'),
    check('keterangan').not().isEmpty().withMessage('keterangan harus ada data')
]

module.exports.edit_data = [
    check('no').not().isEmpty().withMessage('no harus ada data'),
    check('start_time').not().isEmpty().withMessage('start_time harus ada data'),
    check('end_time').not().isEmpty().withMessage('end_time harus ada data'),
    check('keterangan').not().isEmpty().withMessage('keterangan harus ada data')
]